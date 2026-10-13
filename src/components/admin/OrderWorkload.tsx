import Link from "next/link";
import { getOrderListHref, normalizeOrderFilters, type OrderSummary } from "@/lib/orderOperations";

export function OrderWorkload({ summary }: { summary: OrderSummary }) {
  const cards = [
    { label: "Cần xác nhận", count: summary.pending, filters: { status: "pending" }, hint: `${summary.overdue} đơn chờ quá 24 giờ` },
    { label: "Cần đóng gói", count: summary.to_pack, filters: { queue: "to_pack" }, hint: "Đã xác nhận, chưa đóng gói" },
    { label: "Đang giao", count: summary.shipping, filters: { status: "shipping" }, hint: "Theo dõi và xác nhận giao xong" },
    { label: "Cần đối soát", count: summary.to_reconcile, filters: { queue: "to_reconcile" }, hint: "Đã giao, chưa ghi nhận thu tiền" },
    { label: "Cần hoàn tiền", count: summary.to_refund, filters: { queue: "to_refund" }, hint: "Đã hủy nhưng đã thu tiền" },
  ];
  return <section aria-label="Hàng đợi xử lý đơn" className="flex flex-col gap-3">
    <p className="text-sm text-fg-muted">Toàn bộ cửa hàng, không phụ thuộc bộ lọc · {summary.today} đơn đặt hôm nay</p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => <Link key={card.label} href={getOrderListHref(normalizeOrderFilters(card.filters))}
        className="rounded-xl border border-ink-700 bg-ink-900 p-4 hover:border-brand focus-visible:outline-2 focus-visible:outline-brand">
        <p className="text-sm font-medium text-fg-muted">{card.label}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-fg">{card.count}</p>
        <p className="mt-2 text-xs text-fg-muted">{card.hint}</p>
      </Link>)}
    </div>
    {summary.overdue > 0 && <Link href="/admin/don-hang?queue=overdue" className="inline-flex min-h-11 items-center rounded-lg border border-amber-400/30 px-3 text-sm text-amber-400 underline focus-visible:outline-2 focus-visible:outline-brand">{summary.overdue} đơn chờ quá 24 giờ cần liên hệ xác nhận</Link>}
  </section>;
}
