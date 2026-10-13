import { requireAdmin } from "@/lib/auth/requireAdmin";
import { normalizeOrderFilters } from "@/lib/orderOperations";
import { ordersToCsv } from "@/lib/orderExport";
import { getOrderExport } from "@/lib/queries/adminOrderOperations";

export async function GET(request: Request) {
  try { await requireAdmin(); } catch {
    return new Response("Bạn cần đăng nhập bằng tài khoản quản trị để xuất đơn hàng.", { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const filters = normalizeOrderFilters(Object.fromEntries(new URL(request.url).searchParams));
    const orders = await getOrderExport(filters);
    return new Response(ordersToCsv(orders), { headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="don-hang.csv"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Không xuất được đơn hàng.", { status: 422, headers: { "Cache-Control": "no-store" } });
  }
}
