-- Track app activity independently of provider refreshes. A refresh token must
-- not reset an already-expired idle timeout before the application checks it.
create table private.veloce_session_activity (
  session_id uuid primary key references auth.sessions(id) on delete cascade,
  last_seen timestamptz not null default now()
);
alter table private.veloce_session_activity enable row level security;
revoke all on private.veloce_session_activity from public, anon, authenticated;
create index veloce_session_activity_expiry on private.veloce_session_activity(last_seen);

create or replace function private.veloce_session_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.sessions s
    left join private.veloce_session_activity a on a.session_id=s.id
    where s.user_id=auth.uid() and s.id::text=auth.jwt()->>'session_id'
      and s.created_at > now()-interval '7 days'
      and coalesce(a.last_seen,s.created_at) > now()-interval '1 day'
      and (s.not_after is null or s.not_after>now()));
$$;

create function public.veloce_touch_session() returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not private.veloce_trusted_request() then
    raise exception 'Unauthorized' using errcode='42501';
  end if;
  if not private.veloce_session_active() then return false; end if;
  insert into private.veloce_session_activity(session_id,last_seen)
  values((auth.jwt()->>'session_id')::uuid,clock_timestamp())
  on conflict(session_id) do update set last_seen=excluded.last_seen;
  delete from private.veloce_session_activity where last_seen<now()-interval '8 days';
  return true;
end $$;
revoke all on function public.veloce_touch_session() from public,anon;
grant execute on function public.veloce_touch_session() to authenticated;
