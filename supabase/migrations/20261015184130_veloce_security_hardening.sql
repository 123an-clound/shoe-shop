-- Shop-scoped hardening. Do not change shared Auth config or unrelated tables.
-- Configure private.veloce_security_config.server_key_hash before deploying the new app.
create table private.veloce_security_config (
  id smallint primary key check (id = 1),
  server_key_hash text not null check (server_key_hash ~ '^[0-9a-f]{64}$')
);
alter table private.veloce_security_config enable row level security;
revoke all on private.veloce_security_config from public, anon, authenticated;
alter table private.veloce_order_receipts enable row level security;
alter table private.veloce_order_idempotency enable row level security;
alter table if exists private.veloce_form_rate_limits enable row level security;

create function private.veloce_trusted_request() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.veloce_security_config where id = 1
    and server_key_hash = encode(sha256(convert_to(
      coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-veloce-server-token',''), 'UTF8')), 'hex'));
$$;
revoke all on function private.veloce_trusted_request() from public, anon;
grant execute on function private.veloce_trusted_request() to authenticated;

create function private.veloce_session_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.sessions s where s.user_id = auth.uid()
    and s.id::text = auth.jwt()->>'session_id'
    and s.created_at > now() - interval '7 days'
    and coalesce(s.updated_at,s.created_at) > now() - interval '1 day'
    and (s.not_after is null or s.not_after > now()));
$$;
revoke all on function private.veloce_session_active() from public, anon;
grant execute on function private.veloce_session_active() to authenticated;

create function public.veloce_session_valid() returns boolean
language sql stable security invoker set search_path = '' as $$
  select private.veloce_session_active();
$$;
revoke all on function public.veloce_session_valid() from public,anon;
grant execute on function public.veloce_session_valid() to authenticated;

create or replace function private.veloce_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.veloce_session_active() and exists(select 1 from public.veloce_admins where user_id = auth.uid());
$$;

-- Old counter cannot be consumed by arbitrary clients anymore.
-- Revoke the legacy counter in the enforcement migration after app rollout.
create function public.veloce_check_auth_rate_trusted(p_action text,p_identity text,p_source text,p_server_token text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_limit integer; v_window interval;
begin
  if p_server_token is null or length(p_server_token) <> 64 or not exists (
    select 1 from private.veloce_security_config where id=1 and server_key_hash=encode(sha256(convert_to(p_server_token,'UTF8')),'hex')
  ) then raise exception 'Unauthorized' using errcode='42501'; end if;
  if p_action is null or p_action not in ('admin-login','otp-send','otp-verify','media-upload')
    or p_identity is null or p_identity !~ '^[0-9a-f]{64}$'
    or p_source is null or p_source !~ '^[0-9a-f]{64}$'
  then raise exception 'Invalid request' using errcode='22023'; end if;
  v_limit := case p_action when 'otp-send' then 3 when 'media-upload' then 20 else 10 end;
  v_window := case p_action when 'admin-login' then interval '15 minutes' when 'media-upload' then interval '1 hour' else interval '10 minutes' end;
  perform private.veloce_consume_limit('trusted-source',p_source,50,interval '10 minutes');
  perform private.veloce_consume_limit('trusted-'||p_action,p_source||':'||p_identity,v_limit,v_window);
end $$;
revoke all on function public.veloce_check_auth_rate_trusted(text,text,text,text) from public;
grant execute on function public.veloce_check_auth_rate_trusted(text,text,text,text) to anon,authenticated;

-- Private quarantine and exact storage limits. Existing media URLs remain public.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('veloce-uploads','veloce-uploads',false,52428800,array['video/mp4','video/webm']);
update storage.buckets set file_size_limit=52428800,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']
where id='veloce';
create policy veloce_upload_staging on storage.objects for all to authenticated
using (bucket_id='veloce-uploads' and private.veloce_is_admin())
with check (bucket_id='veloce-uploads' and private.veloce_is_admin());

CREATE OR REPLACE FUNCTION private.veloce_assign_customer()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if auth.uid() is not null and not private.veloce_session_active() then raise exception 'Phiên đã hết hạn.' using errcode='42501'; end if;
  new.customer_user_id := auth.uid();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.veloce_customer_receipt(p_order_id uuid, p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_order public.veloce_orders;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return null; end if;
  select o.* into v_order from public.veloce_orders o join private.veloce_order_receipts r on r.order_id = o.id
    where o.id = p_order_id and r.token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
      and ((o.customer_user_id is null and r.claimed_at is null and r.created_at > now() - interval '7 days') or (o.customer_user_id = auth.uid() and private.veloce_session_active()));
  if not found then return null; end if;
  return private.veloce_customer_order_json(v_order);
end;
$function$;

CREATE OR REPLACE FUNCTION public.veloce_claim_customer_order(p_order_id uuid, p_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid := auth.uid(); v_owner uuid; v_receipt private.veloce_order_receipts;
begin
  if not private.veloce_session_active() then raise exception 'Vui lòng đăng nhập.' using errcode='42501'; end if;
  if v_uid is null then raise exception 'Vui lòng đăng nhập.' using errcode = '42501'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return false; end if;
  select customer_user_id into v_owner from public.veloce_orders where id = p_order_id for update;
  if not found then return false; end if;
  select * into v_receipt from private.veloce_order_receipts where order_id = p_order_id for update;
  if not found or v_receipt.token_hash <> encode(sha256(convert_to(p_token, 'UTF8')), 'hex') then return false; end if;
  if v_owner = v_uid then return true; end if;
  if v_owner is not null or v_receipt.claimed_at is not null or v_receipt.created_at <= now() - interval '7 days' then return false; end if;
  update public.veloce_orders set customer_user_id = v_uid where id = p_order_id;
  update private.veloce_order_receipts set claimed_at = now() where order_id = p_order_id;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.veloce_customer_orders(p_page integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid := auth.uid(); v_total bigint; v_orders jsonb;
begin
  if not private.veloce_session_active() then raise exception 'Vui lòng đăng nhập.' using errcode='42501'; end if;
  if v_uid is null then raise exception 'Vui lòng đăng nhập.' using errcode = '42501'; end if;
  if p_page is null or p_page < 1 or p_page > 10000 then raise exception 'Trang không hợp lệ.' using errcode = '22023'; end if;
  select count(*) into v_total from public.veloce_orders where customer_user_id = v_uid;
  select coalesce(jsonb_agg(private.veloce_customer_order_json(o) order by o.created_at desc, o.id desc), '[]'::jsonb)
    into v_orders from (select * from public.veloce_orders where customer_user_id = v_uid order by created_at desc, id desc limit 20 offset (p_page - 1) * 20) o;
  return jsonb_build_object('orders', v_orders, 'total', v_total);
end;
$function$;

CREATE OR REPLACE FUNCTION public.veloce_customer_orders_by_status(p_page integer DEFAULT 1, p_scope text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_total bigint; v_active bigint; v_history bigint; v_all bigint;
  v_page integer; v_orders jsonb;
begin
  if not private.veloce_session_active() then raise exception 'Vui lòng đăng nhập.' using errcode='42501'; end if;
  if v_uid is null then raise exception 'Vui lòng đăng nhập.' using errcode = '42501'; end if;
  if p_page is null or p_page < 1 or p_page > 10000 then raise exception 'Trang không hợp lệ.' using errcode = '22023'; end if;
  if p_scope is null or p_scope not in ('all', 'active', 'history') then raise exception 'Nhóm đơn không hợp lệ.' using errcode = '22023'; end if;

  select count(*), count(*) filter (where status in ('pending', 'confirmed', 'shipping')),
    count(*) filter (where status in ('done', 'cancelled'))
    into v_all, v_active, v_history from public.veloce_orders where customer_user_id = v_uid;
  v_total := case p_scope when 'active' then v_active when 'history' then v_history else v_all end;
  v_page := least(p_page, greatest(1, ((v_total + 19) / 20)::integer));
  select coalesce(jsonb_agg(private.veloce_customer_order_json(o) order by o.created_at desc, o.id desc), '[]'::jsonb)
    into v_orders from (
      select * from public.veloce_orders where customer_user_id = v_uid
        and (p_scope = 'all' or (p_scope = 'active' and status in ('pending', 'confirmed', 'shipping'))
          or (p_scope = 'history' and status in ('done', 'cancelled')))
      order by created_at desc, id desc limit 20 offset (v_page - 1) * 20
    ) o;
  return jsonb_build_object('orders', v_orders, 'total', v_total, 'active_count', v_active,
    'history_count', v_history, 'page', v_page);
end;
$function$;

CREATE OR REPLACE FUNCTION public.veloce_place_order(p_customer_name text, p_customer_phone text, p_address text, p_items jsonb, p_customer_email text DEFAULT NULL::text, p_note text DEFAULT NULL::text, p_coupon_code text DEFAULT NULL::text)
 RETURNS TABLE(order_id uuid, order_code text, order_total bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_item jsonb; v_product record; v_settings record; v_qty int;
  v_subtotal bigint := 0; v_discount bigint := 0; v_ship bigint := 0; v_total bigint := 0;
  v_color jsonb; v_image text;
  v_snapshot jsonb := '[]'::jsonb; v_code text; v_id uuid;
begin
  if length(coalesce(p_note,'')) > 2000 or length(coalesce(p_customer_email,'')) > 254 or length(coalesce(p_coupon_code,'')) > 64 then
    raise exception 'Dữ liệu đặt hàng không hợp lệ.' using errcode='22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Giỏ hàng không hợp lệ';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Giỏ hàng đang trống';
  end if;
  if jsonb_array_length(p_items) > 20 then
    raise exception 'Một đơn tối đa 20 dòng sản phẩm';
  end if;
  if coalesce(trim(p_customer_name), '') = '' or length(p_customer_name) > 120 then
    raise exception 'Họ tên không hợp lệ';
  end if;
  if coalesce(trim(p_customer_phone), '') = '' or length(p_customer_phone) > 20 then
    raise exception 'Số điện thoại không hợp lệ';
  end if;
  if coalesce(trim(p_address), '') = '' or length(p_address) > 500 then
    raise exception 'Địa chỉ không hợp lệ';
  end if;

  select * into v_settings from public.veloce_settings where id = 1;

  -- Khóa hàng theo thứ tự product_id để tránh deadlock khi 2 đơn trùng sản phẩm
  for v_item in
    select value from jsonb_array_elements(p_items) order by (value->>'product_id')
  loop
    v_qty := coalesce((v_item->>'quantity')::int, 0);
    if v_qty <= 0 or v_qty > 10 then
      raise exception 'Số lượng mỗi sản phẩm phải từ 1 đến 10';
    end if;

    select id, name, slug, price, stock, images, is_published, sizes, colors, size_guide
      into v_product
      from public.veloce_products
     where id = (v_item->>'product_id')::uuid
     for update;

    if not found then raise exception 'Sản phẩm không tồn tại'; end if;
    if not v_product.is_published then
      raise exception 'Sản phẩm "%" đã ngừng bán', v_product.name;
    end if;
    if v_product.stock < v_qty then
      raise exception 'Sản phẩm "%" chỉ còn % đôi', v_product.name, v_product.stock;
    end if;
    if (v_item->>'size') is null or not ((v_item->>'size')::int = any (v_product.sizes)) then
      raise exception 'Sản phẩm "%" không có size %', v_product.name, v_item->>'size';
    end if;

    select color.value into v_color
      from jsonb_array_elements(v_product.colors) as color(value)
     where lower(color.value->>'hex') = lower(v_item->>'color');
    if v_color is null then raise exception 'Màu sản phẩm không hợp lệ'; end if;
    v_image := case when (v_color->>'image') = any(v_product.images) then v_color->>'image' else coalesce(v_product.images[1], '') end;

    if exists(select 1 from jsonb_array_elements(v_product.colors) as color(value) where color.value ? 'inventory') then
      update public.veloce_products
         set colors = private.veloce_adjust_variant_inventory(v_product.colors, v_item->>'color', (v_item->>'size')::integer, -v_qty)
       where id = v_product.id;
    else
      update public.veloce_products set stock = stock - v_qty where id = v_product.id;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_snapshot := v_snapshot || jsonb_build_object(
      'product_id', v_product.id, 'slug', v_product.slug, 'name', v_product.name,
      'price', v_product.price,                       -- GIÁ LÚC ĐẶT
      'image', v_image,
      'size', v_item->>'size',
      'size_label', coalesce((select guide->>'label' from jsonb_array_elements(coalesce(v_product.size_guide, '[]'::jsonb)) as guide where guide->>'size' = v_item->>'size' limit 1), v_item->>'size'),
      'color', v_color->>'hex', 'quantity', v_qty
    );
  end loop;

  -- Mã giảm giá đọc từ settings — KHÔNG tin số client gửi lên
  if p_coupon_code is not null
     and coalesce(v_settings.coupon_code, '') <> ''
     and upper(trim(p_coupon_code)) = upper(v_settings.coupon_code)
     and v_settings.coupon_percent > 0
  then
    v_discount := (v_subtotal * v_settings.coupon_percent) / 100;
  end if;

  if (v_subtotal - v_discount) < v_settings.freeship_threshold then
    v_ship := v_settings.shipping_fee;
  end if;
  v_total := v_subtotal - v_discount + v_ship;

  loop
    v_code := 'VLC-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.veloce_orders where code = v_code);
  end loop;

  insert into public.veloce_orders (
    code, customer_name, customer_phone, customer_email, address, note,
    items, subtotal, discount, shipping_fee, total
  ) values (
    v_code, trim(p_customer_name), trim(p_customer_phone), p_customer_email,
    trim(p_address), p_note, v_snapshot, v_subtotal, v_discount, v_ship, v_total
  ) returning id into v_id;

  return query select v_id, v_code, v_total;
end $function$;

CREATE OR REPLACE FUNCTION public.veloce_place_order_idempotent(p_idempotency_key uuid, p_customer_name text, p_customer_phone text, p_address text, p_items jsonb, p_customer_email text DEFAULT NULL::text, p_note text DEFAULT NULL::text, p_coupon_code text DEFAULT NULL::text)
 RETURNS TABLE(order_id uuid, order_code text, order_total bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_request_hash text;
  v_existing_hash text;
  v_existing_order_id uuid;
  v_requester uuid;
  v_order_id uuid;
  v_order_code text;
  v_order_total bigint;
begin
  if length(coalesce(p_note,'')) > 2000 or length(coalesce(p_customer_email,'')) > 254 or length(coalesce(p_coupon_code,'')) > 64 then
    raise exception 'Dữ liệu đặt hàng không hợp lệ.' using errcode='22023';
  end if;
  if p_idempotency_key is null then
    raise exception 'Thiếu mã xác thực yêu cầu đặt hàng' using errcode = '22023';
  end if;

  v_request_hash := pg_catalog.md5(pg_catalog.jsonb_build_object(
    'customer_name', p_customer_name,
    'customer_phone', p_customer_phone,
    'customer_email', p_customer_email,
    'address', p_address,
    'note', p_note,
    'coupon_code', p_coupon_code,
    'items', p_items
  )::text);

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key::text, 0));

  select idempotency.request_hash, idempotency.order_id, idempotency.requester_user_id
    into v_existing_hash, v_existing_order_id, v_requester
    from private.veloce_order_idempotency as idempotency
   where idempotency.idempotency_key = p_idempotency_key;

  if found then
    if v_requester is distinct from auth.uid() then
      raise exception 'Tài khoản đã thay đổi. Hãy kiểm tra đơn hàng trước khi đặt lại.' using errcode = '42501';
    end if;
    if v_existing_hash <> v_request_hash then
      raise exception 'Mã yêu cầu đã được dùng với thông tin khác. Hãy kiểm tra đơn hàng trước khi đặt lại.' using errcode = '22023';
    end if;

    return query
      select orders.id, orders.code, orders.total
        from public.veloce_orders as orders
       where orders.id = v_existing_order_id;
    return;
  end if;

  select placed.order_id, placed.order_code, placed.order_total
    into v_order_id, v_order_code, v_order_total
    from public.veloce_place_order(
      p_customer_name,
      p_customer_phone,
      p_address,
      p_items,
      p_customer_email,
      p_note,
      p_coupon_code
    ) as placed;

  insert into private.veloce_order_idempotency (idempotency_key, request_hash, order_id, requester_user_id)
  values (p_idempotency_key, v_request_hash, v_order_id, auth.uid());

  return query select v_order_id, v_order_code, v_order_total;
end;
$function$;

-- No default grants added, no other app's data or roles changed.
