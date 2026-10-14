-- Preserve the original size label in order snapshots; stock still uses the numeric variant key.
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
end $function$

