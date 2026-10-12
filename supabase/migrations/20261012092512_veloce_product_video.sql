-- Video riêng, giữ nguyên ảnh và bảng hướng dẫn size hiện có.
alter table public.veloce_products add column video_url text;

-- Chỉ mở định dạng video cho bucket của shop; quyền ghi vẫn theo policy admin hiện có.
update storage.buckets
set file_size_limit = greatest(coalesce(file_size_limit, 52428800), 52428800),
    allowed_mime_types = case when allowed_mime_types is null then null else
      array(select distinct mime from unnest(allowed_mime_types || array['video/mp4', 'video/webm']) as mime)
    end
where id = 'veloce';
