import Link from "next/link";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";
import { getOrderListHref, ORDER_QUEUE_LABEL, PAYMENT_LABEL, type OrderFilters as Filters, type OrderSummary } from "@/lib/orderOperations";

const control = "h-11 min-w-0 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-brand sm:text-sm";

export function OrderFilters({ filters, summary }: { filters: Filters; summary: OrderSummary }) {
  const total = summary.pending + summary.confirmed + summary.shipping + summary.done + summary.cancelled;
  return <div className="flex flex-col gap-4">
    <nav aria-label="Lọc theo trạng thái đơn" className="flex flex-wrap gap-2">
      {(["all", ...Object.keys(ORDER_STATUS_LABEL)] as (OrderStatus | "all")[]).map((status) => (
        <Link key={status} href={getOrderListHref({ ...filters, status, queue: "all" })}
          aria-current={filters.status === status && filters.queue === "all" ? "page" : undefined}
          className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand ${filters.status === status && filters.queue === "all" ? "border-brand bg-brand/10 text-fg" : "border-ink-700 text-fg-muted hover:bg-ink-800"}`}>
          {status === "all" ? "Tất cả" : ORDER_STATUS_LABEL[status]} <span className="tabular-nums">{status === "all" ? total : summary[status]}</span>
        </Link>
      ))}
    </nav>
    <form method="get" className="grid grid-cols-1 gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-3">
        <label htmlFor="order-search" className="text-sm text-fg-muted">Tìm mã đơn, tên khách, điện thoại, email hoặc mã vận đơn</label>
        <input id="order-search" name="q" defaultValue={filters.search} maxLength={60} className={control} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-status" className="text-sm text-fg-muted">Trạng thái</label>
        <select id="order-status" name="status" defaultValue={filters.status} className={control}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-payment" className="text-sm text-fg-muted">Thanh toán</label>
        <select id="order-payment" name="payment" defaultValue={filters.payment} className={control}>
          <option value="all">Tất cả thanh toán</option>
          {Object.entries(PAYMENT_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-queue" className="text-sm text-fg-muted">Hàng đợi công việc</label>
        <select id="order-queue" name="queue" defaultValue={filters.queue} className={control}>
          {Object.entries(ORDER_QUEUE_LABEL).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-from" className="text-sm text-fg-muted">Đặt từ ngày (giờ Việt Nam)</label>
        <input id="order-from" type="date" name="from" defaultValue={filters.from} className={control} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="order-to" className="text-sm text-fg-muted">Đến hết ngày</label>
        <input id="order-to" type="date" name="to" defaultValue={filters.to} className={control} />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <button type="submit" className="min-h-11 rounded-lg bg-brand px-4 text-sm font-medium text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">Lọc đơn hàng</button>
        <Link href="/admin/don-hang" className="inline-flex min-h-11 items-center text-sm text-fg-muted underline focus-visible:outline-2 focus-visible:outline-brand">Đặt lại</Link>
      </div>
    </form>
    {filters.queue !== "all" && <p className="text-sm text-fg-muted">Hàng đợi “{ORDER_QUEUE_LABEL[filters.queue]}” tự chọn trạng thái và thanh toán phù hợp với công việc.</p>}
    {filters.from && filters.to && filters.from > filters.to && <p role="alert" className="text-sm text-red-400">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}
  </div>;
}
