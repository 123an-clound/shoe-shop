-- Shop-scoped counters. No changes to shared Auth configuration or other apps.
create table private.veloce_request_limits (
  scope text not null,
  subject_hash text not null,
  expires_at timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (scope, subject_hash)
);
revoke all on private.veloce_request_limits from public, anon, authenticated;
alter table private.veloce_request_limits enable row level security;
create index veloce_request_limits_expiry on private.veloce_request_limits(expires_at);

create function private.veloce_consume_limit(p_scope text, p_subject text, p_limit integer, p_window interval)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_hits integer; v_now timestamptz := clock_timestamp();
begin
  insert into private.veloce_request_limits(scope, subject_hash, expires_at, hits)
  values (p_scope, md5(p_subject), v_now + p_window, 1)
  on conflict (scope, subject_hash) do update
    set hits = case when private.veloce_request_limits.expires_at <= v_now then 1 else private.veloce_request_limits.hits + 1 end,
        expires_at = case when private.veloce_request_limits.expires_at <= v_now then v_now + p_window else private.veloce_request_limits.expires_at end
  returning hits into v_hits;
  if v_hits > p_limit then
    raise exception 'Quá nhiều yêu cầu. Vui lòng chờ ít phút rồi thử lại.' using errcode = 'P0001';
  end if;
  -- Counters are bounded to recent identities; failed calls roll back atomically.
  delete from private.veloce_request_limits where expires_at < v_now - interval '1 day';
end $$;
revoke all on function private.veloce_consume_limit(text,text,integer,interval) from public, anon, authenticated;

create function private.veloce_guard_public_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_identity text;
begin
  if tg_table_schema <> 'public' then raise exception 'Invalid scope'; end if;
  if tg_table_name = 'veloce_orders' then
    v_identity := regexp_replace(coalesce(new.customer_phone,''), '[^0-9]', '', 'g');
    if left(v_identity,2) = '84' then v_identity := '0' || substr(v_identity,3); end if;
    if v_identity !~ '^0[0-9]{9,10}$' then raise exception 'Số điện thoại không hợp lệ' using errcode = '22023'; end if;
    perform private.veloce_consume_limit('order-phone-short', v_identity, 5, interval '15 minutes');
    perform private.veloce_consume_limit('order-phone-day', v_identity, 20, interval '1 day');
    if auth.uid() is not null then
      perform private.veloce_consume_limit('order-account', auth.uid()::text, 20, interval '1 hour');
    end if;
    perform private.veloce_consume_limit('order-global', 'shop', 60, interval '1 minute');
  elsif tg_table_name in ('veloce_contact_messages','veloce_newsletter_subscribers') then
    v_identity := lower(trim(coalesce(new.email,'')));
    if length(v_identity) > 254 or v_identity !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
      raise exception 'Email không hợp lệ' using errcode = '22023';
    end if;
    perform private.veloce_consume_limit(tg_table_name || '-identity', v_identity, 5, interval '1 hour');
    perform private.veloce_consume_limit(tg_table_name || '-global', 'shop', 60, interval '1 minute');
  else
    raise exception 'Invalid scope';
  end if;
  return new;
end $$;
revoke all on function private.veloce_guard_public_insert() from public, anon, authenticated;

-- All order RPCs converge on this insert. Replayed idempotent orders do not insert.
create trigger veloce_orders_abuse_guard before insert on public.veloce_orders
for each row execute function private.veloce_guard_public_insert();
create trigger veloce_contact_abuse_guard before insert on public.veloce_contact_messages
for each row execute function private.veloce_guard_public_insert();
create trigger veloce_newsletter_abuse_guard before insert on public.veloce_newsletter_subscribers
for each row execute function private.veloce_guard_public_insert();

-- Separate committed request for login failures; cannot be used for authorization.
create function public.veloce_check_auth_rate(p_action text, p_identity text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_limit integer; v_window interval;
begin
  if p_action is null or p_action not in ('admin-login','otp-send','otp-verify')
    or p_identity is null or length(p_identity) > 254
    or p_identity !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Dữ liệu không hợp lệ' using errcode = '22023';
  end if;
  v_limit := case p_action when 'otp-send' then 3 else 10 end;
  v_window := case p_action when 'admin-login' then interval '15 minutes' else interval '10 minutes' end;
  perform private.veloce_consume_limit('auth-' || p_action, lower(trim(p_identity)), v_limit, v_window);
  perform private.veloce_consume_limit('auth-global', 'shop', 200, interval '1 minute');
end $$;
revoke all on function public.veloce_check_auth_rate(text,text) from public;
grant execute on function public.veloce_check_auth_rate(text,text) to anon, authenticated;
