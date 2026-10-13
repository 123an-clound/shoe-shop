-- Customer identity comes from the verified JWT, never checkout contact fields.
alter table public.veloce_orders add column customer_user_id uuid references auth.users(id) on delete set null;
create index veloce_orders_customer_history_idx on public.veloce_orders(customer_user_id, created_at desc, id desc) where customer_user_id is not null;
alter table private.veloce_order_idempotency add column requester_user_id uuid;

create function private.veloce_assign_customer() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.customer_user_id := auth.uid();
  return new;
end;
$$;
revoke all on function private.veloce_assign_customer() from public, anon, authenticated;
create trigger veloce_assign_customer before insert on public.veloce_orders
for each row execute function private.veloce_assign_customer();

create table private.veloce_order_receipts (
  order_id uuid primary key references public.veloce_orders(id) on delete cascade,
  token_hash text not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
revoke all on private.veloce_order_receipts from public, anon, authenticated;

-- Only this explicit projection can be returned to a customer. Keep base-table
-- RLS admin-only: internal notes, contact details and audit events stay private.
create function private.veloce_customer_order_json(p_order public.veloce_orders) returns jsonb
language sql immutable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id', p_order.id, 'code', p_order.code, 'created_at', p_order.created_at,
    'status', p_order.status, 'items', p_order.items,
    'subtotal', p_order.subtotal, 'discount', p_order.discount,
    'shipping_fee', p_order.shipping_fee, 'total', p_order.total,
    'shipping_carrier', p_order.shipping_carrier, 'tracking_number', p_order.tracking_number,
    'packed_at', p_order.packed_at, 'payment_status', p_order.payment_status
  );
$$;
revoke all on function private.veloce_customer_order_json(public.veloce_orders) from public, anon, authenticated;

create function public.veloce_customer_orders(p_page integer default 1) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_total bigint; v_orders jsonb;
begin
  if v_uid is null then raise exception 'Vui lòng đăng nhập.' using errcode = '42501'; end if;
  if p_page is null or p_page < 1 or p_page > 10000 then raise exception 'Trang không hợp lệ.' using errcode = '22023'; end if;
  select count(*) into v_total from public.veloce_orders where customer_user_id = v_uid;
  select coalesce(jsonb_agg(private.veloce_customer_order_json(o) order by o.created_at desc, o.id desc), '[]'::jsonb)
    into v_orders from (select * from public.veloce_orders where customer_user_id = v_uid order by created_at desc, id desc limit 20 offset (p_page - 1) * 20) o;
  return jsonb_build_object('orders', v_orders, 'total', v_total);
end;
$$;
revoke all on function public.veloce_customer_orders(integer) from public, anon;
grant execute on function public.veloce_customer_orders(integer) to authenticated;

create function public.veloce_customer_receipt(p_order_id uuid, p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_order public.veloce_orders;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return null; end if;
  select o.* into v_order from public.veloce_orders o join private.veloce_order_receipts r on r.order_id = o.id
    where o.id = p_order_id and r.token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
      and ((o.customer_user_id is null and r.claimed_at is null) or o.customer_user_id = auth.uid());
  if not found then return null; end if;
  return private.veloce_customer_order_json(v_order);
end;
$$;
revoke all on function public.veloce_customer_receipt(uuid, text) from public;
grant execute on function public.veloce_customer_receipt(uuid, text) to anon, authenticated;

create function public.veloce_claim_customer_order(p_order_id uuid, p_token text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_owner uuid; v_receipt private.veloce_order_receipts;
begin
  if v_uid is null then raise exception 'Vui lòng đăng nhập.' using errcode = '42501'; end if;
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return false; end if;
  select customer_user_id into v_owner from public.veloce_orders where id = p_order_id for update;
  if not found then return false; end if;
  select * into v_receipt from private.veloce_order_receipts where order_id = p_order_id for update;
  if not found or v_receipt.token_hash <> encode(sha256(convert_to(p_token, 'UTF8')), 'hex') then return false; end if;
  if v_owner = v_uid then return true; end if;
  if v_owner is not null or v_receipt.claimed_at is not null then return false; end if;
  update public.veloce_orders set customer_user_id = v_uid where id = p_order_id;
  update private.veloce_order_receipts set claimed_at = now() where order_id = p_order_id;
  return true;
end;
$$;
revoke all on function public.veloce_claim_customer_order(uuid, text) from public, anon;
grant execute on function public.veloce_claim_customer_order(uuid, text) to authenticated;

create function public.veloce_place_order_with_receipt(
  p_idempotency_key uuid, p_receipt_token text,
  p_customer_name text, p_customer_phone text, p_address text, p_items jsonb,
  p_customer_email text default null, p_note text default null, p_coupon_code text default null
) returns table(order_id uuid, order_code text, order_total bigint)
language plpgsql security definer set search_path = '' as $$
declare v_existing uuid; v_id uuid; v_code text; v_total bigint; v_hash text;
begin
  if p_receipt_token is null or p_receipt_token !~ '^[0-9a-f]{64}$' then raise exception 'Biên nhận không hợp lệ.' using errcode = '22023'; end if;
  if p_idempotency_key is null then raise exception 'Thiếu mã yêu cầu.' using errcode = '22023'; end if;
  v_hash := encode(sha256(convert_to(p_receipt_token, 'UTF8')), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select i.order_id into v_existing from private.veloce_order_idempotency i where i.idempotency_key = p_idempotency_key;
  if found and not exists (select 1 from private.veloce_order_receipts r where r.order_id = v_existing and r.token_hash = v_hash) then
    raise exception 'Yêu cầu đã được xử lý. Hãy kiểm tra đơn hàng trước khi đặt lại.' using errcode = '22023';
  end if;
  select p.order_id, p.order_code, p.order_total into v_id, v_code, v_total from public.veloce_place_order_idempotent(
    p_idempotency_key, p_customer_name, p_customer_phone, p_address, p_items, p_customer_email, p_note, p_coupon_code) p;
  if v_existing is null then
    insert into private.veloce_order_receipts(order_id, token_hash, claimed_at) values (v_id, v_hash, case when auth.uid() is not null then now() end);
  end if;
  return query select v_id, v_code, v_total;
end;
$$;
revoke all on function public.veloce_place_order_with_receipt(uuid, text, text, text, text, jsonb, text, text, text) from public;
grant execute on function public.veloce_place_order_with_receipt(uuid, text, text, text, text, jsonb, text, text, text) to anon, authenticated;

create or replace function public.veloce_place_order_idempotent(
  p_idempotency_key uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_items jsonb,
  p_customer_email text default null,
  p_note text default null,
  p_coupon_code text default null
)
returns table(order_id uuid, order_code text, order_total bigint)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_request_hash text;
  v_existing_hash text;
  v_existing_order_id uuid;
  v_requester uuid;
  v_order_id uuid;
  v_order_code text;
  v_order_total bigint;
begin
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

revoke all on function public.veloce_place_order_idempotent(uuid, text, text, text, jsonb, text, text, text) from public;
grant execute on function public.veloce_place_order_idempotent(uuid, text, text, text, jsonb, text, text, text) to anon, authenticated;
