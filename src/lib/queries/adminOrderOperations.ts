import { PublicError } from "@/lib/security/errors";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";
import { orderDateBounds, orderSummarySchema, type OrderFilters } from "@/lib/orderOperations";

export const ORDER_PAGE_SIZE = 25;
export const ORDER_EXPORT_LIMIT = 2000;
const listColumns = "id,code,created_at,updated_at,customer_name,customer_phone,customer_email,address,status,payment_status,total,shipping_carrier,tracking_number,packed_at" as const;
export type OrderListItem = Pick<Tables<"veloce_orders">, "id" | "code" | "created_at" | "updated_at" | "customer_name" | "customer_phone" | "customer_email" | "address" | "status" | "payment_status" | "total" | "shipping_carrier" | "tracking_number" | "packed_at">;

function filteredOrders(supabase: SupabaseClient<Database>, filters: OrderFilters) {
  let query = supabase.from("veloce_orders").select(listColumns, { count: "exact" });
  if (filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.payment === "unrecorded") query = query.is("payment_status", null);
  else if (filters.payment !== "all") query = query.eq("payment_status", filters.payment);
  const bounds = orderDateBounds(filters);
  if (bounds.from) query = query.gte("created_at", bounds.from);
  if (bounds.to) query = query.lt("created_at", bounds.to);
  if (filters.queue === "overdue") query = query.lt("created_at", new Date(Date.now() - 86400000).toISOString());
  if (filters.queue === "to_pack") query = query.is("packed_at", null);
  const conditions: string[] = [];
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(`or(code.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term},customer_email.ilike.${term},tracking_number.ilike.${term})`);
  }
  if (filters.queue === "to_reconcile") conditions.push("or(payment_status.is.null,payment_status.eq.unpaid)");
  if (conditions.length) query = query.or(`and(${conditions.join(",")})`);
  return query;
}

export async function getOrderPage(filters: OrderFilters, page = 1) {
  const supabase = await createClient();
  const currentPage = Number.isSafeInteger(page) ? Math.max(1, Math.min(page, 100000)) : 1;
  const from = (currentPage - 1) * ORDER_PAGE_SIZE;
  const { data, error, count } = await filteredOrders(supabase, filters)
    .order("created_at", { ascending: false }).order("id", { ascending: false }).range(from, from + ORDER_PAGE_SIZE - 1);
  if (error) throw new PublicError("Không tải được danh sách đơn hàng. Hãy thử lại.");
  return { orders: data ?? [], count: count ?? 0, page: currentPage, pageSize: ORDER_PAGE_SIZE };
}

export async function getOrderSummary() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("veloce_admin_order_summary");
  if (error) throw new PublicError("Không tải được tổng quan xử lý đơn hàng.");
  return orderSummarySchema.parse(data);
}

export async function getOrderEvents(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("veloce_order_events").select("*")
    .eq("order_id", orderId).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(100);
  if (error) throw new PublicError("Không tải được lịch sử thao tác của đơn hàng.");
  return data ?? [];
}

export async function getOrderExport(filters: OrderFilters) {
  const supabase = await createClient();
  const { data, error, count } = await filteredOrders(supabase, filters)
    .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(ORDER_EXPORT_LIMIT);
  if (error) throw new PublicError("Không xuất được đơn hàng. Hãy thử lại.");
  if ((count ?? 0) > ORDER_EXPORT_LIMIT) throw new PublicError("Có hơn 2.000 đơn phù hợp. Thu hẹp khoảng ngày hoặc trạng thái trước khi xuất CSV.");
  return data ?? [];
}
