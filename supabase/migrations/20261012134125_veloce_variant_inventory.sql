-- Deploy before saving variant inventory in admin. Existing stock is deliberately
-- not split across sizes/colors: the shop owner must enter the actual counts.
-- colors: [{name, hex, image?, inventory?: [{size, quantity}]}].
-- No table/type changes; the existing JSONB column and generated types remain valid.

create or replace function private.veloce_adjust_variant_inventory(
  p_colors jsonb, p_color text, p_size integer, p_delta integer
)
returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_color jsonb; v_entry jsonb; v_color_index integer; v_size_index integer;
  v_quantity bigint;
begin
  select color.value, (color.ordinality - 1)::integer
    into v_color, v_color_index
    from pg_catalog.jsonb_array_elements(p_colors) with ordinality as color(value, ordinality)
   where pg_catalog.lower(color.value->>'hex') = pg_catalog.lower(p_color);
  if v_color is null then
    raise exception 'Màu đã bị xóa hoặc không hợp lệ. Khôi phục biến thể trước khi hoàn kho.';
  end if;
  select entry.value, (entry.ordinality - 1)::integer
    into v_entry, v_size_index
    from pg_catalog.jsonb_array_elements(v_color->'inventory') with ordinality as entry(value, ordinality)
   where (entry.value->>'size')::integer = p_size;
  if v_entry is null then
    raise exception 'Size đã bị xóa hoặc không hợp lệ. Khôi phục biến thể trước khi hoàn kho.';
  end if;
  v_quantity := (v_entry->>'quantity')::bigint + p_delta;
  if v_quantity < 0 then
    raise exception 'Màu % size % chỉ còn % đôi', v_color->>'name', p_size, v_entry->>'quantity';
  end if;
  if v_quantity > 2147483647 then raise exception 'Tồn kho vượt giới hạn cho phép'; end if;
  return pg_catalog.jsonb_set(p_colors, array[v_color_index::text, 'inventory', v_size_index::text, 'quantity'], pg_catalog.to_jsonb(v_quantity));
end;
$$;

revoke all on function private.veloce_adjust_variant_inventory(jsonb, text, integer, integer) from public, anon;
grant execute on function private.veloce_adjust_variant_inventory(jsonb, text, integer, integer) to authenticated;

create or replace function private.veloce_validate_variant_inventory()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_color jsonb; v_entry jsonb; v_hexes text[] := '{}'; v_sizes integer[];
  v_total bigint := 0; v_tracked boolean; v_quantity numeric;
begin
  if pg_catalog.jsonb_typeof(new.colors) is distinct from 'array' then
    raise exception 'Danh sách màu không hợp lệ';
  end if;
  select exists(select 1 from pg_catalog.jsonb_array_elements(new.colors) as c where c ? 'inventory') into v_tracked;
  if tg_op = 'UPDATE' and not v_tracked then
    if exists(select 1 from pg_catalog.jsonb_array_elements(old.colors) as c where c ? 'inventory') then
      raise exception 'Không thể bỏ tồn kho theo biến thể sau khi đã phân bổ';
    end if;
  end if;
  if pg_catalog.cardinality(new.sizes) <> (select pg_catalog.count(distinct s) from pg_catalog.unnest(new.sizes) as s) then
    raise exception 'Size không được trùng nhau';
  end if;
  for v_color in select value from pg_catalog.jsonb_array_elements(new.colors)
  loop
    if coalesce(v_color->>'hex', '') !~ '^#[0-9a-fA-F]{6}$' or coalesce(pg_catalog.btrim(v_color->>'name'), '') = '' then
      raise exception 'Màu không hợp lệ';
    end if;
    if pg_catalog.lower(v_color->>'hex') = any(v_hexes) then raise exception 'Mã màu không được trùng nhau'; end if;
    v_hexes := pg_catalog.array_append(v_hexes, pg_catalog.lower(v_color->>'hex'));
    if v_color->>'image' is not null and not ((v_color->>'image') = any(new.images)) then
      raise exception 'Ảnh màu phải thuộc bộ ảnh sản phẩm';
    end if;
    if not v_tracked then continue; end if;
    if pg_catalog.jsonb_typeof(v_color->'inventory') is distinct from 'array' then
      raise exception 'Nhập tồn kho cho tất cả các màu';
    end if;
    v_sizes := '{}';
    for v_entry in select value from pg_catalog.jsonb_array_elements(v_color->'inventory')
    loop
      if pg_catalog.jsonb_typeof(v_entry->'size') is distinct from 'number' or
         pg_catalog.jsonb_typeof(v_entry->'quantity') is distinct from 'number' then
        raise exception 'Size và số lượng phải là số nguyên';
      end if;
      if (v_entry->>'size')::numeric <> pg_catalog.trunc((v_entry->>'size')::numeric) then raise exception 'Size phải là số nguyên'; end if;
      if not ((v_entry->>'size')::integer = any(new.sizes)) or (v_entry->>'size')::integer = any(v_sizes) then
        raise exception 'Size tồn kho không hợp lệ hoặc bị trùng';
      end if;
      v_sizes := pg_catalog.array_append(v_sizes, (v_entry->>'size')::integer);
      v_quantity := (v_entry->>'quantity')::numeric;
      if v_quantity <> pg_catalog.trunc(v_quantity) or v_quantity < 0 or v_quantity > 2147483647 then
        raise exception 'Số lượng phải là số nguyên từ 0 trở lên';
      end if;
      v_total := v_total + v_quantity::bigint;
    end loop;
    if pg_catalog.cardinality(v_sizes) <> pg_catalog.cardinality(new.sizes) then raise exception 'Nhập tồn kho cho từng size'; end if;
  end loop;
  if v_total > 2147483647 then raise exception 'Tổng tồn kho vượt giới hạn cho phép'; end if;
  if v_tracked then new.stock := v_total::integer; end if;
  if new.stock < 0 then raise exception 'Tồn kho không được âm'; end if;
  return new;
end;
$$;

revoke all on function private.veloce_validate_variant_inventory() from public, anon, authenticated;
drop trigger if exists veloce_products_variant_inventory on public.veloce_products;
create trigger veloce_products_variant_inventory
  before insert or update on public.veloce_products
  for each row execute function private.veloce_validate_variant_inventory();

create or replace function public.veloce_place_order(
  p_customer_name  text,
  p_customer_phone text,
  p_address        text,
  p_items          jsonb,           -- [{product_id, size, color, quantity}]
  p_customer_email text default null,
  p_note           text default null,
  p_coupon_code    text default null
)
returns table (order_id uuid, order_code text, order_total bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item jsonb; v_product record; v_settings record; v_qty int;
  v_subtotal bigint := 0; v_discount bigint := 0; v_ship bigint := 0; v_total bigint := 0;
  v_color jsonb; v_image text;
  v_snapshot jsonb := '[]'::jsonb; v_code text; v_id uuid;
begin
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

    select id, name, slug, price, stock, images, is_published, sizes, colors
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
      'size', v_item->>'size', 'color', v_color->>'hex', 'quantity', v_qty
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
end $$;

revoke all on function public.veloce_place_order(text,text,text,jsonb,text,text,text) from public;
grant execute on function public.veloce_place_order(text,text,text,jsonb,text,text,text) to anon, authenticated;

-- Hủy đơn và hoàn kho. SECURITY INVOKER nên RLS vẫn chặn: chỉ admin update được đơn.
create or replace function public.veloce_cancel_order(p_order_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare v_order record; v_item jsonb; v_product record;
begin
  if not private.veloce_is_admin() then raise exception 'Không có quyền quản trị'; end if;
  select * into v_order from public.veloce_orders where id = p_order_id for update;
  if not found then raise exception 'Không tìm thấy đơn hàng'; end if;
  if v_order.status = 'cancelled' then raise exception 'Đơn này đã hủy rồi'; end if;
  if v_order.status = 'done' then raise exception 'Đơn đã giao xong, không hủy được'; end if;

  for v_item in select value from jsonb_array_elements(v_order.items) order by value->>'product_id'
  loop
    select id, colors into v_product from public.veloce_products
     where id = (v_item->>'product_id')::uuid for update;
    if not found then continue; end if;
    if exists(select 1 from jsonb_array_elements(v_product.colors) as color(value) where color.value ? 'inventory') then
      update public.veloce_products
         set colors = private.veloce_adjust_variant_inventory(v_product.colors, v_item->>'color', (v_item->>'size')::integer, (v_item->>'quantity')::integer)
       where id = v_product.id;
    else
      update public.veloce_products set stock = stock + (v_item->>'quantity')::integer where id = v_product.id;
    end if;
  end loop;

  update public.veloce_orders set status = 'cancelled' where id = p_order_id;
end $$;

revoke all on function public.veloce_cancel_order(uuid) from public, anon;
grant execute on function public.veloce_cancel_order(uuid) to authenticated;

-- Prevent new admin code from saving allocations against the old checkout RPC.
create or replace function public.veloce_variant_inventory_ready()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from pg_catalog.pg_trigger
     where tgrelid = 'public.veloce_products'::pg_catalog.regclass
       and tgname = 'veloce_products_variant_inventory'
       and tgenabled in ('O', 'A')
  );
$$;
revoke all on function public.veloce_variant_inventory_ready() from public, anon;
grant execute on function public.veloce_variant_inventory_ready() to authenticated;
