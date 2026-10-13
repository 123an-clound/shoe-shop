import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrderPage, getOrderSummary } from "@/lib/queries/adminOrderOperations";
import { getOrderListHref, normalizeOrderFilters } from "@/lib/orderOperations";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrderWorkload } from "@/components/admin/OrderWorkload";
import { OrderRefreshButton } from "@/components/admin/OrderRefreshButton";

export const metadata: Metadata = { title: "Xử lý đơn hàng — Quản trị" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = normalizeOrderFilters(params);
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(rawPage) ? Math.max(1, Math.min(rawPage, 100000)) : 1;
  const [result, summary] = await Promise.all([getOrderPage(filters, page), getOrderSummary()]);
  const pageCount = Math.max(1, Math.ceil(result.count / result.pageSize));
  const currentPage = Math.min(result.page, pageCount);
  if (currentPage !== page) redirect(getOrderListHref(filters, currentPage));

  return <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold text-fg">Xử lý đơn hàng</h1><p className="mt-2 text-sm text-fg-muted">Tiếp nhận, đóng gói, giao hàng và đối soát đơn online.</p></div>
      <OrderRefreshButton />
    </div>
    <OrderWorkload summary={summary} />
    <OrderFilters key={JSON.stringify(filters)} filters={filters} summary={summary} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-fg-muted" aria-live="polite">{result.count} đơn phù hợp · Trang {currentPage}/{pageCount}</p>
      <a href={getOrderListHref(filters, 1, "/admin/don-hang/xuat")} className="inline-flex min-h-11 items-center rounded-lg border border-ink-700 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand">Xuất CSV theo bộ lọc (tối đa 2.000 đơn)</a>
    </div>
    <OrdersTable orders={result.orders} />
    {pageCount > 1 && <nav aria-label="Phân trang đơn hàng" className="flex items-center justify-between gap-3">
      {currentPage > 1 ? <Link rel="prev" href={getOrderListHref(filters, currentPage - 1)} className="inline-flex min-h-11 items-center rounded-lg border border-ink-700 px-4 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand">Trang trước</Link> : <span />}
      {currentPage < pageCount ? <Link rel="next" href={getOrderListHref(filters, currentPage + 1)} className="inline-flex min-h-11 items-center rounded-lg border border-ink-700 px-4 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand">Trang sau</Link> : <span />}
    </nav>}
  </div>;
}
