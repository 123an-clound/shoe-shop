-- Additive order operations. Old orders keep an unknown payment state.
alter table public.veloce_orders
  add column internal_note text,
  add column shipping_carrier text,
  add column tracking_number text,
  add column payment_status text,
  add column packed_at timestamptz,
  add column paid_at timestamptz,
  add column refunded_at timestamptz,
  add column confirmed_at timestamptz,
  add column shipped_at timestamptz,
  add column completed_at timestamptz,
  add column cancelled_at timestamptz,
  add column cancellation_reason text;
alter table public.veloce_orders alter column payment_status set default 'unpaid';
alter table public.veloce_orders
  add constraint veloce_orders_payment_state check (payment_status in ('unpaid','paid','refunded')),
  add constraint veloce_orders_operations_lengths check (
    coalesce(length(internal_note),0)<=2000 and coalesce(length(shipping_carrier),0)<=100
    and coalesce(length(tracking_number),0)<=100 and coalesce(length(cancellation_reason),0)<=500);

create table public.veloce_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.veloce_orders(id),
  actor_id uuid,
  actor_name text not null,
  event_type text not null check (event_type in ('created','updated')),
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index veloce_order_events_order_time on public.veloce_order_events(order_id,created_at desc,id desc);
create index veloce_orders_status_created on public.veloce_orders(status,created_at desc);
create index veloce_orders_payment_created on public.veloce_orders(payment_status,created_at desc);
alter table public.veloce_order_events enable row level security;
revoke all on public.veloce_order_events from public, anon, authenticated;
grant select on public.veloce_order_events to authenticated;
create policy veloce_order_events_admin_read on public.veloce_order_events
  for select to authenticated using ((select private.veloce_is_admin()));

-- Validation also applies to direct authorized updates, while retaining the stock RPC.
create function private.veloce_order_operations_validate()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    if not ((old.status='pending' and new.status='confirmed')
      or (old.status='confirmed' and new.status='shipping')
      or (old.status='shipping' and new.status='done')
      or (old.status in ('pending','confirmed','shipping') and new.status='cancelled')) then
      raise exception 'Trạng thái đơn không thể chuyển tiếp từ trạng thái hiện tại';
    end if;
    if new.status='shipping' and (new.packed_at is null or nullif(btrim(new.shipping_carrier),'') is null or nullif(btrim(new.tracking_number),'') is null) then
      raise exception 'Đóng gói và nhập hãng vận chuyển, mã vận đơn trước khi giao hàng';
    end if;
    if new.status='confirmed' then new.confirmed_at=now(); end if;
    if new.status='shipping' then new.shipped_at=now(); end if;
    if new.status='done' then new.completed_at=now(); end if;
    if new.status='cancelled' then new.cancelled_at=now(); end if;
  end if;
  if new.packed_at is distinct from old.packed_at and (old.status<>'confirmed' or new.status not in ('confirmed','shipping')) then
    raise exception 'Chỉ đóng gói hoặc bỏ đánh dấu đóng gói đơn đã xác nhận';
  end if;
  if new.payment_status is distinct from old.payment_status then
    if old.payment_status='refunded' or (old.payment_status='paid' and new.payment_status is distinct from 'refunded')
      or new.payment_status is null then raise exception 'Không thể chuyển trạng thái thanh toán này'; end if;
    if new.payment_status='refunded' then
      if old.payment_status is distinct from 'paid' or new.status<>'cancelled' then
        raise exception 'Chỉ ghi nhận hoàn tiền cho đơn đã thu tiền và đã hủy';
      end if;
      new.refunded_at=now();
    end if;
    if new.payment_status='paid' then new.paid_at=now(); end if;
  end if;
  return new;
end $$;
revoke all on function private.veloce_order_operations_validate() from public,anon,authenticated;
create trigger veloce_orders_operations_validate before update on public.veloce_orders
  for each row execute function private.veloce_order_operations_validate();

-- Private definer trigger can append history; clients only receive SELECT privileges.
create function private.veloce_order_record_event()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_changes jsonb='{}'; v_key text; v_actor_name text;
begin
  if tg_op='UPDATE' then
    foreach v_key in array array['status','packed_at','shipping_carrier','tracking_number','payment_status','internal_note','cancellation_reason'] loop
      if to_jsonb(new)->v_key is distinct from to_jsonb(old)->v_key then
        v_changes=v_changes||jsonb_build_object(v_key,jsonb_build_object('from',to_jsonb(old)->v_key,'to',to_jsonb(new)->v_key));
      end if;
    end loop;
    if v_changes='{}'::jsonb then return new; end if;
  end if;
  select coalesce(nullif(full_name,''),'Quản trị viên') into v_actor_name from public.veloce_admins where user_id=auth.uid();
  insert into public.veloce_order_events(order_id,actor_id,actor_name,event_type,changes)
    values(new.id,auth.uid(),coalesce(v_actor_name,case when tg_op='INSERT' then 'Khách hàng' else 'Hệ thống' end),case when tg_op='INSERT' then 'created' else 'updated' end,v_changes);
  return new;
end $$;
revoke all on function private.veloce_order_record_event() from public,anon,authenticated;
create trigger veloce_orders_record_event after insert or update on public.veloce_orders
  for each row execute function private.veloce_order_record_event();

create function public.veloce_admin_update_order(p_order_id uuid,p_expected_updated_at timestamptz,p_patch jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_order public.veloce_orders%rowtype; v_key text;
begin
  if not private.veloce_is_admin() then raise exception 'Không có quyền quản trị'; end if;
  if p_patch is null or jsonb_typeof(p_patch)<>'object' or p_patch='{}'::jsonb then raise exception 'Dữ liệu cập nhật không hợp lệ'; end if;
  for v_key in select jsonb_object_keys(p_patch) loop
    if v_key not in ('status','internal_note','shipping_carrier','tracking_number','payment_status','packed') then raise exception 'Trường cập nhật không hợp lệ'; end if;
    if v_key='packed' then
      if jsonb_typeof(p_patch->v_key)<>'boolean' then raise exception 'Dữ liệu đóng gói không hợp lệ'; end if;
    elsif jsonb_typeof(p_patch->v_key)<>'string' then raise exception 'Dữ liệu cập nhật phải là chuỗi'; end if;
  end loop;
  select * into v_order from public.veloce_orders where id=p_order_id for update;
  if not found then raise exception 'Không tìm thấy đơn hàng'; end if;
  if p_expected_updated_at is null or v_order.updated_at<>p_expected_updated_at then raise exception 'Đơn hàng vừa thay đổi. Tải lại trang trước khi lưu tiếp'; end if;
  if p_patch ? 'status' and (p_patch->>'status' not in ('confirmed','shipping','done') or p_patch->>'status'=v_order.status) then raise exception 'Trạng thái cập nhật không hợp lệ'; end if;
  if p_patch ? 'payment_status' and p_patch->>'payment_status' not in ('unpaid','paid','refunded') then raise exception 'Thanh toán không hợp lệ'; end if;
  if v_order.status in ('done','cancelled') and (p_patch ? 'shipping_carrier' or p_patch ? 'tracking_number' or p_patch ? 'packed') then raise exception 'Không sửa vận chuyển của đơn đã kết thúc'; end if;
  update public.veloce_orders set
    status=case when p_patch ? 'status' then p_patch->>'status' else status end,
    internal_note=case when p_patch ? 'internal_note' then nullif(btrim(p_patch->>'internal_note'),'') else internal_note end,
    shipping_carrier=case when p_patch ? 'shipping_carrier' then nullif(btrim(p_patch->>'shipping_carrier'),'') else shipping_carrier end,
    tracking_number=case when p_patch ? 'tracking_number' then nullif(btrim(p_patch->>'tracking_number'),'') else tracking_number end,
    payment_status=case when p_patch ? 'payment_status' then p_patch->>'payment_status' else payment_status end,
    packed_at=case when p_patch ? 'packed' then case when (p_patch->>'packed')::boolean then coalesce(packed_at,now()) else null end else packed_at end
  where id=p_order_id;
end $$;
revoke all on function public.veloce_admin_update_order(uuid,timestamptz,jsonb) from public,anon;
grant execute on function public.veloce_admin_update_order(uuid,timestamptz,jsonb) to authenticated;

create function public.veloce_admin_cancel_order(p_order_id uuid,p_expected_updated_at timestamptz,p_reason text,p_goods_returned boolean default false)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_order public.veloce_orders%rowtype;
begin
  if not private.veloce_is_admin() then raise exception 'Không có quyền quản trị'; end if;
  if p_reason is null or length(btrim(p_reason))<3 or length(p_reason)>500 then raise exception 'Nhập lý do hủy từ 3 đến 500 ký tự'; end if;
  select * into v_order from public.veloce_orders where id=p_order_id for update;
  if not found then raise exception 'Không tìm thấy đơn hàng'; end if;
  if p_expected_updated_at is null or v_order.updated_at<>p_expected_updated_at then raise exception 'Đơn hàng vừa thay đổi. Tải lại trang trước khi hủy'; end if;
  if v_order.status='shipping' and p_goods_returned is distinct from true then raise exception 'Xác nhận hàng đã về kho trước khi hủy đơn đang giao'; end if;
  if v_order.status not in ('pending','confirmed','shipping') then raise exception 'Đơn đã kết thúc, không thể hủy'; end if;
  update public.veloce_orders set cancellation_reason=btrim(p_reason) where id=p_order_id;
  perform public.veloce_cancel_order(p_order_id);
end $$;
revoke all on function public.veloce_admin_cancel_order(uuid,timestamptz,text,boolean) from public,anon;
grant execute on function public.veloce_admin_cancel_order(uuid,timestamptz,text,boolean) to authenticated;

create function public.veloce_admin_order_summary()
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_result jsonb;
begin
  if not private.veloce_is_admin() then raise exception 'Không có quyền quản trị'; end if;
  select jsonb_build_object(
    'pending',count(*) filter(where status='pending'),
    'confirmed',count(*) filter(where status='confirmed'),
    'shipping',count(*) filter(where status='shipping'),
    'done',count(*) filter(where status='done'),
    'cancelled',count(*) filter(where status='cancelled'),
    'overdue',count(*) filter(where status='pending' and created_at<now()-interval '24 hours'),
    'to_pack',count(*) filter(where status='confirmed' and packed_at is null),
    'to_refund',count(*) filter(where status='cancelled' and payment_status='paid'),
    'to_reconcile',count(*) filter(where status='done' and payment_status is distinct from 'paid' and payment_status is distinct from 'refunded'),
    'today',count(*) filter(where created_at >= date_trunc('day',now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')
  ) into v_result from public.veloce_orders;
  return v_result;
end $$;
revoke all on function public.veloce_admin_order_summary() from public,anon;
grant execute on function public.veloce_admin_order_summary() to authenticated;
