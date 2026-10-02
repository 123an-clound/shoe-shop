-- English fields and lightweight storefront controls. Existing Vietnamese fields
-- remain the source of truth for the current URLs and existing records.
alter table public.veloce_settings
  add column if not exists slogan_en text,
  add column if not exists hero_headline_en text,
  add column if not exists hero_subheadline_en text,
  add column if not exists hero_cta_label_vi text,
  add column if not exists hero_cta_label_en text,
  add column if not exists hero_secondary_label_vi text,
  add column if not exists hero_secondary_label_en text,
  add column if not exists announcement_enabled boolean not null default false,
  add column if not exists announcement_text_vi text,
  add column if not exists announcement_text_en text,
  add column if not exists homepage_sections jsonb not null default '["hero","marquee","categories","featured","story","stats","testimonials","newsletter"]'::jsonb,
  add column if not exists seo_title_vi text,
  add column if not exists seo_title_en text,
  add column if not exists seo_description_vi text,
  add column if not exists seo_description_en text,
  add column if not exists og_image_url text;

alter table public.veloce_products
  add column if not exists name_en text,
  add column if not exists description_en text,
  add column if not exists features_en text[];

alter table public.veloce_categories
  add column if not exists name_en text,
  add column if not exists description_en text;

alter table public.veloce_testimonials
  add column if not exists role_en text,
  add column if not exists content_en text;
