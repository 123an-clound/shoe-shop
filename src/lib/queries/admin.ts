import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Order = Tables<"veloce_orders">;
export type AdminProduct = Tables<"veloce_products">;
export type AdminTestimonial = Tables<"veloce_testimonials">;

/**
 * Truy vấn dành riêng cho khu quản trị — luôn dùng client đã đăng nhập (server.ts)
 * để RLS cấp đủ quyền đọc, không dùng client anon. Không cache vì admin cần
 * số liệu chính xác theo thời gian thực.
 */
export async function getPendingOrderCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("veloce_orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function getLatestOrder(): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRevenueLast30Days(): Promise<number> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("veloce_orders")
    .select("total")
    .neq("status", "cancelled")
    .gte("created_at", since);
  return (data ?? []).reduce((sum, row) => sum + row.total, 0);
}

export async function getTotalProductCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("veloce_products")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function getLowStockProducts(threshold = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_products")
    .select("id, name, slug, stock")
    .lte("stock", threshold)
    .order("stock", { ascending: true });
  return data ?? [];
}

/** Lấy TẤT CẢ sản phẩm kể cả chưa publish — chỉ dùng trong khu quản trị. */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("veloce_products").select("*").order("sort_order");
  return data ?? [];
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_orders")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getAdminTestimonials(): Promise<AdminTestimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veloce_testimonials")
    .select("*")
    .order("sort_order");
  return data ?? [];
}
