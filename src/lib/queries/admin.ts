import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Order = Tables<"veloce_orders">;
export type AdminProduct = Tables<"veloce_products">;
export type AdminTestimonial = Tables<"veloce_testimonials">;
export const ADMIN_ORDER_PAGE_SIZE = 25;

function throwIfQueryFailed(error: { message: string; code?: string } | null, context: string): void {
  if (error) throw new Error(`${context} (${error.code ?? "database error"}).`);
}

/**
 * Truy vấn dành riêng cho khu quản trị — luôn dùng client đã đăng nhập (server.ts)
 * để RLS cấp đủ quyền đọc, không dùng client anon. Không cache vì admin cần
 * số liệu chính xác theo thời gian thực.
 */
export async function getPendingOrderCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("veloce_orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  throwIfQueryFailed(error, "Không tải được số đơn đang chờ");
  return count ?? 0;
}

export async function getLatestOrder(): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veloce_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfQueryFailed(error, "Không tải được đơn hàng mới nhất");
  return data;
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veloce_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  throwIfQueryFailed(error, "Không tải được đơn hàng gần đây");
  return data ?? [];
}

export async function getRevenueLast30Days(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("veloce_admin_revenue_last_30_days");
  throwIfQueryFailed(error, "Không tải được doanh thu đã hoàn tất trong 30 ngày");
  return data ?? 0;
}

export async function getTotalProductCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("veloce_products")
    .select("id", { count: "exact", head: true });
  throwIfQueryFailed(error, "Không tải được số lượng sản phẩm");
  return count ?? 0;
}

export async function getLowStockProducts(threshold = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veloce_products")
    .select("id, name, slug, stock")
    .lte("stock", threshold)
    .order("stock", { ascending: true });
  throwIfQueryFailed(error, "Không tải được sản phẩm sắp hết hàng");
  return data ?? [];
}

/** Lấy TẤT CẢ sản phẩm kể cả chưa publish — chỉ dùng trong khu quản trị. */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("veloce_products").select("*").order("sort_order");
  throwIfQueryFailed(error, "Không tải được danh sách sản phẩm quản trị");
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veloce_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfQueryFailed(error, "Không tải được sản phẩm cần sửa");
  return data;
}

export async function getAdminOrders(page = 1, search = "") {
  const supabase = await createClient();
  const safeSearch = search.normalize("NFC").replace(/[^\p{L}\p{N}@+ ._-]/gu, "").trim().slice(0, 60);
  const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const from = (currentPage - 1) * ADMIN_ORDER_PAGE_SIZE;
  let query = supabase
    .from("veloce_orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_ORDER_PAGE_SIZE - 1);
  if (safeSearch) {
    const term = `%${safeSearch}%`;
    query = query.or(`code.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term}`);
  }
  const { data, error, count } = await query;
  throwIfQueryFailed(error, "Không tải được danh sách đơn hàng");
  return {
    orders: data ?? [],
    count: count ?? 0,
    page: currentPage,
    pageSize: ADMIN_ORDER_PAGE_SIZE,
    search: safeSearch,
  };
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veloce_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfQueryFailed(error, "Không tải được đơn hàng");
  return data;
}

export async function getAdminTestimonials(): Promise<AdminTestimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("veloce_testimonials")
    .select("*")
    .order("sort_order");
  throwIfQueryFailed(error, "Không tải được đánh giá cửa hàng");
  return data ?? [];
}
