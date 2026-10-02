create table if not exists public.veloce_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  message text not null check (char_length(message) between 10 and 4000),
  locale text not null check (locale in ('vi', 'en')),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists veloce_contact_messages_created_idx
  on public.veloce_contact_messages (created_at desc);

alter table public.veloce_contact_messages enable row level security;
revoke all on table public.veloce_contact_messages from public, anon, authenticated;
grant select, update on table public.veloce_contact_messages to authenticated;

drop policy if exists "veloce admins manage contact messages" on public.veloce_contact_messages;
create policy "veloce admins manage contact messages"
  on public.veloce_contact_messages for all to authenticated
  using (private.veloce_is_admin())
  with check (private.veloce_is_admin());

create table if not exists public.veloce_newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null check (locale in ('vi', 'en')),
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists veloce_newsletter_email_lower_uidx
  on public.veloce_newsletter_subscribers (lower(email));
create index if not exists veloce_newsletter_created_idx
  on public.veloce_newsletter_subscribers (created_at desc);

alter table public.veloce_newsletter_subscribers enable row level security;
revoke all on table public.veloce_newsletter_subscribers from public, anon, authenticated;
grant select, update on table public.veloce_newsletter_subscribers to authenticated;

drop policy if exists "veloce admins manage newsletter subscribers" on public.veloce_newsletter_subscribers;
create policy "veloce admins manage newsletter subscribers"
  on public.veloce_newsletter_subscribers for all to authenticated
  using (private.veloce_is_admin())
  with check (private.veloce_is_admin());

create table if not exists private.veloce_form_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null,
  submission_count integer not null check (submission_count > 0)
);
revoke all on table private.veloce_form_rate_limits from public, anon, authenticated;

create or replace function public.veloce_submit_contact_message(
  p_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_locale text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email text := lower(trim(p_email));
  v_rate_key text;
  v_count integer;
begin
  if p_name is null or char_length(trim(p_name)) not between 2 and 120
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(v_email) > 254
     or (p_phone is not null and char_length(trim(p_phone)) > 40)
     or p_message is null or char_length(trim(p_message)) not between 10 and 4000
     or p_locale not in ('vi', 'en') then
    raise exception 'Invalid contact form data' using errcode = '22023';
  end if;

  v_rate_key := pg_catalog.md5('contact:' || v_email);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_rate_key, 0));

  insert into private.veloce_form_rate_limits (rate_key, window_started_at, submission_count)
  values (v_rate_key, pg_catalog.now(), 1)
  on conflict (rate_key) do update
    set submission_count = case
          when private.veloce_form_rate_limits.window_started_at < pg_catalog.now() - interval '1 hour' then 1
          else private.veloce_form_rate_limits.submission_count + 1
        end,
        window_started_at = case
          when private.veloce_form_rate_limits.window_started_at < pg_catalog.now() - interval '1 hour' then pg_catalog.now()
          else private.veloce_form_rate_limits.window_started_at
        end
  returning submission_count into v_count;

  if v_count > 5 then
    raise exception 'Too many contact messages. Please try again later.' using errcode = 'P0001';
  end if;

  insert into public.veloce_contact_messages (name, email, phone, message, locale)
  values (trim(p_name), v_email, nullif(trim(p_phone), ''), trim(p_message), p_locale)

  delete from private.veloce_form_rate_limits
   where window_started_at < pg_catalog.now() - interval '1 day';

end;
$function$;

create or replace function public.veloce_subscribe_newsletter(p_email text, p_locale text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or char_length(v_email) > 254
     or p_locale not in ('vi', 'en') then
    raise exception 'Invalid newsletter form data' using errcode = '22023';
  end if;

  insert into public.veloce_newsletter_subscribers (email, locale)
  values (v_email, p_locale)
  on conflict (lower(email)) do update
    set status = 'active', locale = excluded.locale;
end;
$function$;

revoke all on function public.veloce_submit_contact_message(text, text, text, text, text) from public;
grant execute on function public.veloce_submit_contact_message(text, text, text, text, text) to anon, authenticated;
revoke all on function public.veloce_subscribe_newsletter(text, text) from public;
grant execute on function public.veloce_subscribe_newsletter(text, text) to anon, authenticated;

drop trigger if exists veloce_contact_messages_touch on public.veloce_contact_messages;
create trigger veloce_contact_messages_touch before update on public.veloce_contact_messages
  for each row execute function public.veloce_touch_updated_at();
drop trigger if exists veloce_newsletter_subscribers_touch on public.veloce_newsletter_subscribers;
create trigger veloce_newsletter_subscribers_touch before update on public.veloce_newsletter_subscribers
  for each row execute function public.veloce_touch_updated_at();
