import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminOrders } from "@/lib/queries/admin";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const metadata: Metadata = { title: "Đơn hàng — Quản trị" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const result = await getAdminOrders(page, typeof params.q === "string" ? params.q : "");
  const pageCount = Math.max(1, Math.ceil(result.count / result.pageSize));
  const currentPage = Math.min(result.page, pageCount);
  const pageHref = (target: number) => {
    const query = new URLSearchParams();
    if (result.search) query.set("q", result.search);
    query.set("page", String(target));
    return `/admin/don-hang?${query.toString()}`;
  };
  if (currentPage !== page) redirect(pageHref(currentPage));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Đơn hàng</h1>
      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex max-w-xl flex-1 flex-col gap-1.5">
          <label htmlFor="order-search" className="text-sm text-fg-muted">Tìm mã đơn, khách hàng hoặc số điện thoại</label>
          <input id="order-search" name="q" defaultValue={result.search} maxLength={60} className="h-11 rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        <button type="submit" className="h-11 rounded-lg bg-brand px-5 text-sm font-medium text-on-brand hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">Tìm đơn</button>
        {result.search && <Link href="/admin/don-hang" className="flex h-11 items-center px-2 text-sm text-fg-muted hover:text-fg">Xóa tìm kiếm</Link>}
      </form>
      <p className="text-sm text-fg-muted" aria-live="polite">{result.count} đơn hàng · Trang {currentPage}/{pageCount}</p>
      <OrdersTable orders={result.orders} />
      {pageCount > 1 && (
        <nav aria-label="Phân trang đơn hàng" className="flex items-center justify-between">
          {currentPage > 1 ? <Link rel="prev" href={pageHref(currentPage - 1)} className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-fg hover:border-brand">Đơn mới hơn</Link> : <span />}
          {currentPage < pageCount ? <Link rel="next" href={pageHref(currentPage + 1)} className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-fg hover:border-brand">Đơn cũ hơn</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
