-- ============================================================================
-- VELOCE — schema tham chiếu
--
-- ⚠️ FILE NÀY CHỈ ĐỂ ĐỌC VÀ ĐỐI CHIẾU. Toàn bộ nội dung dưới đây ĐÃ ĐƯỢC ÁP
-- lên project Supabase `xsspvdgnhelzprcqaiek` ngày 25/08/2026.
-- KHÔNG chạy lại — sẽ không hỏng gì (mọi lệnh đều idempotent) nhưng cũng
-- không có tác dụng gì.
--
-- Project này còn chứa dữ liệu của dự án khác, nên MỌI bảng của VELOCE đều
-- mang tiền tố `veloce_`. Tuyệt đối không đụng bảng không có tiền tố đó.
-- ============================================================================

create extension if not exists pgcrypto;

-- ────────────────────────────── BẢNG ──────────────────────────────

create table if not exists public.veloce_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  image_url   text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.veloce_products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  brand          text not null default 'VELOCE',
  category_id    uuid references public.veloce_categories(id) on delete set null,
  price          bigint not null check (price >= 0),              -- VND, số nguyên
  original_price bigint check (original_price is null or original_price >= price),
  description    text   not null default '',
  features       text[] not null default '{}',
  sizes          int[]  not null default '{}',                    -- 39..45
  colors         jsonb  not null default '[]'::jsonb,             -- [{name, hex}]
  images         text[] not null default '{}',                    -- URL công khai trên Storage
  unsplash_id    text,                                            -- mã ảnh gốc, dùng cho gen:images
  rating         numeric(2,1) not null default 5.0 check (rating >= 0 and rating <= 5),
  review_count   int  not null default 0,
  badge          text check (badge in ('NEW','SALE','HOT','LIMITED')),
  stock          int  not null default 0,
  is_published   boolean not null default true,
  sort_order     int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists veloce_products_category_idx  on public.veloce_products (category_id);
create index if not exists veloce_products_published_idx on public.veloce_products (is_published);
create index if not exists veloce_products_slug_idx      on public.veloce_products (slug);

-- Cài đặt cửa hàng — CHỈ 1 DÒNG, id luôn = 1
create table if not exists public.veloce_settings (
  id                 smallint primary key default 1 check (id = 1),
  store_name         text not null default 'VELOCE',
  slogan             text not null default '',
  hero_headline      text,
  hero_subheadline   text,
  logo_url           text,
  hero_image_url     text,
  color_primary      text not null default '#8b5cf6',
  color_secondary    text not null default '#d946ef',
  color_accent       text not null default '#22d3ee',
  phone              text,
  email              text,
  address            text,
  facebook_url       text,
  instagram_url      text,
  zalo_url           text,
  coupon_code        text,
  coupon_percent     int not null default 0 check (coupon_percent >= 0 and coupon_percent <= 100),
  freeship_threshold bigint not null default 1000000,
  updated_at         timestamptz not null default now()
);

-- Ai được vào trang admin. Thêm dòng ở đây = cấp quyền cao nhất.
create table if not exists public.veloce_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

create table if not exists public.veloce_testimonials (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  avatar_url   text,
  content      text not null,
  rating       int  not null default 5 check (rating >= 1 and rating <= 5),
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- items là BẢN CHỤP tên + giá lúc đặt, không phải khoá ngoại tới sản phẩm.
-- Giá đổi sau này không được làm sai đơn cũ.
create table if not exists public.veloce_orders (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,                   -- VLC-XXXXXX
  customer_name  text not null,
  customer_phone text not null,
  customer_email text,
  address        text not null,
  note           text,
  items          jsonb  not null default '[]'::jsonb,
  subtotal       bigint not null default 0,
  discount       bigint not null default 0,
  shipping_fee   bigint not null default 0,
  total          bigint not null default 0,
  status         text   not null default 'pending'
                 check (status in ('pending','confirmed','shipping','done','cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists veloce_orders_status_idx  on public.veloce_orders (status);
create index if not exists veloce_orders_created_idx on public.veloce_orders (created_at desc);

-- ────────────────────────── TRIGGER updated_at ──────────────────────────

create or replace function public.veloce_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp      -- cố định search_path theo yêu cầu của Supabase advisor
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists veloce_products_touch on public.veloce_products;
create trigger veloce_products_touch before update on public.veloce_products
  for each row execute function public.veloce_touch_updated_at();

drop trigger if exists veloce_settings_touch on public.veloce_settings;
create trigger veloce_settings_touch before update on public.veloce_settings
  for each row execute function public.veloce_touch_updated_at();

drop trigger if exists veloce_orders_touch on public.veloce_orders;
create trigger veloce_orders_touch before update on public.veloce_orders
  for each row execute function public.veloce_touch_updated_at();

-- ──────────────────────────── HÀM KIỂM TRA QUYỀN ────────────────────────────
--
-- Hàm nằm trong schema `private` CỐ Ý: schema này không nằm trong Exposed
-- schemas nên Supabase KHÔNG sinh endpoint /rest/v1/rpc/veloce_is_admin,
-- trong khi RLS policy vẫn gọi được bình thường.
-- ĐỪNG chuyển nó sang schema public.
--
-- SECURITY DEFINER để policy trên veloce_admins không tự gọi lại chính nó
-- gây đệ quy vô hạn.

create schema if not exists private;

create or replace function private.veloce_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.veloce_admins where user_id = auth.uid());
$$;

revoke all on function private.veloce_is_admin() from public, anon;
grant execute on function private.veloce_is_admin() to authenticated;
grant usage on schema private to authenticated;

-- ────────────────────────────────── RLS ──────────────────────────────────
--
-- anon           : đọc nội dung đã publish + CHỈ insert được đơn hàng
-- authenticated  : như anon, trừ khi có dòng trong veloce_admins
-- admin          : toàn quyền, kể cả Storage
--
-- Chú ý: policy đọc của anon KHÔNG gọi hàm nào, để không phải cấp EXECUTE
-- private.veloce_is_admin() cho vai trò anon.

alter table public.veloce_categories   enable row level security;
alter table public.veloce_products     enable row level security;
alter table public.veloce_settings     enable row level security;
alter table public.veloce_admins       enable row level security;
alter table public.veloce_testimonials enable row level security;
alter table public.veloce_orders       enable row level security;

-- Danh mục
create policy veloce_categories_read  on public.veloce_categories
  for select to anon, authenticated using (true);
create policy veloce_categories_admin on public.veloce_categories
  for all to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());

-- Sản phẩm
create policy veloce_products_read_anon on public.veloce_products
  for select to anon using (is_published = true);
create policy veloce_products_read_auth on public.veloce_products
  for select to authenticated using (is_published = true or private.veloce_is_admin());
create policy veloce_products_admin on public.veloce_products
  for all to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());

-- Cài đặt cửa hàng (không có policy insert/delete — bảng chỉ có đúng 1 dòng)
create policy veloce_settings_read   on public.veloce_settings
  for select to anon, authenticated using (true);
create policy veloce_settings_update on public.veloce_settings
  for update to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());

-- Đánh giá
create policy veloce_testimonials_read_anon on public.veloce_testimonials
  for select to anon using (is_published = true);
create policy veloce_testimonials_read_auth on public.veloce_testimonials
  for select to authenticated using (is_published = true or private.veloce_is_admin());
create policy veloce_testimonials_admin on public.veloce_testimonials
  for all to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());

-- Danh sách admin — chỉ admin đọc. KHÔNG có policy ghi:
-- thêm admin phải làm từ SQL Editor (xem _seed/README.md mục 2).
create policy veloce_admins_read on public.veloce_admins
  for select to authenticated using (private.veloce_is_admin());

-- Đơn hàng — khách đặt được nhưng KHÔNG đọc lại được đơn của người khác
create policy veloce_orders_insert on public.veloce_orders
  for insert to anon, authenticated with check (true);
create policy veloce_orders_admin  on public.veloce_orders
  for all to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());

-- ──────────────────────────────── STORAGE ────────────────────────────────
-- Bucket `veloce`: đọc công khai, ghi chỉ admin, tối đa 5MB/file, chỉ nhận ảnh.
-- Quy ước đường dẫn:
--   products/{slug}-1.jpg  products/{slug}-2.jpg  products/{slug}-3.jpg
--   branding/logo.png      branding/hero.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('veloce', 'veloce', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'];

create policy veloce_storage_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'veloce');

create policy veloce_storage_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'veloce' and private.veloce_is_admin());

create policy veloce_storage_update on storage.objects
  for update to authenticated
  using (bucket_id = 'veloce' and private.veloce_is_admin())
  with check (bucket_id = 'veloce' and private.veloce_is_admin());

create policy veloce_storage_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'veloce' and private.veloce_is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC ĐẶT HÀNG & TỒN KHO
--
-- Tồn kho tự trừ khi khách đặt, hết hàng thì chặn mua. KHÔNG làm bằng nhiều
-- query rời từ client được: hai khách bấm mua cùng lúc đôi cuối cùng sẽ cùng
-- đọc thấy stock = 1 và cùng đặt thành công. `for update` khóa từng hàng
-- sản phẩm cho tới hết transaction.
--
-- SECURITY DEFINER là BẮT BUỘC: khách vãng lai (anon) không có quyền update
-- veloce_products, nhưng đặt hàng thì phải trừ kho. Hàm này là con đường
-- được kiểm soát DUY NHẤT cho phép anon chạm vào tồn kho.
--
-- ⚠️ Supabase advisor sẽ cảnh báo về việc anon gọi được hàm SECURITY DEFINER
-- này. Đó là chủ ý. ĐỪNG revoke execute — sẽ hỏng chức năng đặt hàng.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.veloce_settings
  add column if not exists shipping_fee bigint not null default 30000;

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
  v_snapshot jsonb := '[]'::jsonb; v_code text; v_id uuid;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
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

    select id, name, slug, price, stock, images, is_published, sizes
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
    if (v_item->>'size') is not null
       and not ((v_item->>'size')::int = any (v_product.sizes)) then
      raise exception 'Sản phẩm "%" không có size %', v_product.name, v_item->>'size';
    end if;

    update public.veloce_products set stock = stock - v_qty where id = v_product.id;

    v_subtotal := v_subtotal + v_product.price * v_qty;
    v_snapshot := v_snapshot || jsonb_build_object(
      'product_id', v_product.id, 'slug', v_product.slug, 'name', v_product.name,
      'price', v_product.price,                       -- GIÁ LÚC ĐẶT
      'image', coalesce(v_product.images[1], ''),
      'size', v_item->>'size', 'color', v_item->>'color', 'quantity', v_qty
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
declare v_order record; v_item jsonb;
begin
  select * into v_order from public.veloce_orders where id = p_order_id for update;
  if not found then raise exception 'Không tìm thấy đơn hàng'; end if;
  if v_order.status = 'cancelled' then raise exception 'Đơn này đã hủy rồi'; end if;
  if v_order.status = 'done' then raise exception 'Đơn đã giao xong, không hủy được'; end if;

  for v_item in select value from jsonb_array_elements(v_order.items)
  loop
    update public.veloce_products
       set stock = stock + (v_item->>'quantity')::int
     where id = (v_item->>'product_id')::uuid;
  end loop;

  update public.veloce_orders set status = 'cancelled' where id = p_order_id;
end $$;

revoke all on function public.veloce_cancel_order(uuid) from public, anon;
grant execute on function public.veloce_cancel_order(uuid) to authenticated;
