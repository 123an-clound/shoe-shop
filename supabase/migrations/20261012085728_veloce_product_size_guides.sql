-- Bảng size riêng; NULL giữ bảng mặc định cho các sản phẩm hiện có.
alter table public.veloce_products
  add column size_guide jsonb,
  add constraint veloce_products_size_guide_check check (
    size_guide is null or (
      jsonb_typeof(size_guide) = 'array'
      and jsonb_array_length(size_guide) between 1 and 60
    )
  );
