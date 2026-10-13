-- Filter before pagination, using only the verified owner's safe projection.
create function public.veloce_customer_orders_by_status(p_page integer default 1, p_scope text default 'all') returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_total bigint; v_active bigint; v_history bigint; v_all bigint;
  v_page integer; v_orders jsonb;
begin
  if v_uid is null then raise exception 'Vui lòng đăng nhập.' using errcode = '42501'; end if;
  if p_page is null or p_page < 1 or p_page > 10000 then raise exception 'Trang không hợp lệ.' using errcode = '22023'; end if;
  if p_scope is null or p_scope not in ('all', 'active', 'history') then raise exception 'Nhóm đơn không hợp lệ.' using errcode = '22023'; end if;

  select count(*), count(*) filter (where status in ('pending', 'confirmed', 'shipping')),
    count(*) filter (where status in ('done', 'cancelled'))
    into v_all, v_active, v_history from public.veloce_orders where customer_user_id = v_uid;
  v_total := case p_scope when 'active' then v_active when 'history' then v_history else v_all end;
  v_page := least(p_page, greatest(1, ((v_total + 19) / 20)::integer));
  select coalesce(jsonb_agg(private.veloce_customer_order_json(o) order by o.created_at desc, o.id desc), '[]'::jsonb)
    into v_orders from (
      select * from public.veloce_orders where customer_user_id = v_uid
        and (p_scope = 'all' or (p_scope = 'active' and status in ('pending', 'confirmed', 'shipping'))
          or (p_scope = 'history' and status in ('done', 'cancelled')))
      order by created_at desc, id desc limit 20 offset (v_page - 1) * 20
    ) o;
  return jsonb_build_object('orders', v_orders, 'total', v_total, 'active_count', v_active,
    'history_count', v_history, 'page', v_page);
end;
$$;
revoke all on function public.veloce_customer_orders_by_status(integer, text) from public, anon;
grant execute on function public.veloce_customer_orders_by_status(integer, text) to authenticated;
