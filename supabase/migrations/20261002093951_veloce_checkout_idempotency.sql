-- Keep checkout retries from creating a second order or decrementing stock again.
-- Apply this migration before deploying the storefront code that calls the new RPC.

create table if not exists private.veloce_order_idempotency (
  idempotency_key uuid primary key,
  request_hash text not null,
  order_id uuid not null unique references public.veloce_orders(id) on delete cascade,
  created_at timestamptz not null default now()
);

revoke all on table private.veloce_order_idempotency from public, anon, authenticated;

create or replace function public.veloce_place_order_idempotent(
  p_idempotency_key uuid,
  p_customer_name text,
  p_customer_phone text,
  p_address text,
  p_items jsonb,
  p_customer_email text default null,
  p_note text default null,
  p_coupon_code text default null
)
returns table(order_id uuid, order_code text, order_total bigint)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_request_hash text;
  v_existing_hash text;
  v_existing_order_id uuid;
  v_order_id uuid;
  v_order_code text;
  v_order_total bigint;
begin
  if p_idempotency_key is null then
    raise exception 'Thiếu mã xác thực yêu cầu đặt hàng' using errcode = '22023';
  end if;

  v_request_hash := pg_catalog.md5(pg_catalog.jsonb_build_object(
    'customer_name', p_customer_name,
    'customer_phone', p_customer_phone,
    'customer_email', p_customer_email,
    'address', p_address,
    'note', p_note,
    'coupon_code', p_coupon_code,
    'items', p_items
  )::text);

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_idempotency_key::text, 0));

  select idempotency.request_hash, idempotency.order_id
    into v_existing_hash, v_existing_order_id
    from private.veloce_order_idempotency as idempotency
   where idempotency.idempotency_key = p_idempotency_key;

  if found then
    if v_existing_hash <> v_request_hash then
      raise exception 'Mã yêu cầu đã được dùng với thông tin khác. Hãy kiểm tra đơn hàng trước khi đặt lại.' using errcode = '22023';
    end if;

    return query
      select orders.id, orders.code, orders.total
        from public.veloce_orders as orders
       where orders.id = v_existing_order_id;
    return;
  end if;

  select placed.order_id, placed.order_code, placed.order_total
    into v_order_id, v_order_code, v_order_total
    from public.veloce_place_order(
      p_customer_name,
      p_customer_phone,
      p_address,
      p_items,
      p_customer_email,
      p_note,
      p_coupon_code
    ) as placed;

  insert into private.veloce_order_idempotency (idempotency_key, request_hash, order_id)
  values (p_idempotency_key, v_request_hash, v_order_id);

  return query select v_order_id, v_order_code, v_order_total;
end;
$function$;

revoke all on function public.veloce_place_order_idempotent(uuid, text, text, text, jsonb, text, text, text) from public;
grant execute on function public.veloce_place_order_idempotent(uuid, text, text, text, jsonb, text, text, text) to anon, authenticated;

-- Aggregate revenue in Postgres instead of downloading every completed order.
-- SECURITY INVOKER keeps the existing veloce_orders RLS policy in force.
create or replace function public.veloce_admin_revenue_last_30_days()
returns bigint
language sql
stable
security invoker
set search_path = ''
as $function$
  select coalesce(pg_catalog.sum(orders.total), 0)::bigint
    from public.veloce_orders as orders
   where orders.status = 'done'
     and orders.created_at >= pg_catalog.now() - interval '30 days';
$function$;

revoke all on function public.veloce_admin_revenue_last_30_days() from public;
grant execute on function public.veloce_admin_revenue_last_30_days() to authenticated;
