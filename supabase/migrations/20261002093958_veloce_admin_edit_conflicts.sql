-- Give category and testimonial edits the same optimistic concurrency checks
-- already used by products and settings.

alter table public.veloce_categories
  add column if not exists updated_at timestamptz not null default now();

alter table public.veloce_testimonials
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists veloce_categories_touch on public.veloce_categories;
create trigger veloce_categories_touch
  before update on public.veloce_categories
  for each row execute function public.veloce_touch_updated_at();

drop trigger if exists veloce_testimonials_touch on public.veloce_testimonials;
create trigger veloce_testimonials_touch
  before update on public.veloce_testimonials
  for each row execute function public.veloce_touch_updated_at();
