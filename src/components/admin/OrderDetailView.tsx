import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { OrderProcessingPanel } from "@/components/admin/OrderProcessingPanel";
import { OrderUtilityActions } from "@/components/admin/OrderUtilityActions";
import { OrderTimeline } from "@/components/admin/OrderTimeline";
import { OrderPrintSlip } from "@/components/admin/OrderPrintSlip";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { formatOrderDate, paymentLabel } from "@/lib/orderOperations";
import { getOrderItems } from "@/lib/orderItems";
import { formatVND } from "@/lib/format";
import type { Order } from "@/lib/queries/admin";
import type { Tables } from "@/types/database";

const card = "min-w-0 rounded-xl border border-ink-700 bg-ink-900 p-5";

export function OrderDetailView({ order, events, storeName }: { order: Order; events: Tables<"veloce_order_events">[]; storeName: string }) {
  const items = getOrderItems(order.items);
  const stage = ORDER_STATUS_FLOW.indexOf(order.status as (typeof ORDER_STATUS_FLOW)[number]);
  return <div>
    <div data-no-print className="flex flex-col gap-6">
      <Link href="/admin/don-hang" className="inline-flex min-h-11 self-start items-center text-sm text-fg-muted underline focus-visible:outline-2 focus-visible:outline-brand">Quay lại danh sách đơn</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-2xl font-bold text-fg">{order.code}</h1><Badge tone={order.status === "done" ? "lime" : "brand"}>{isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status}</Badge></div>
          <p className="mt-2 text-sm text-fg-muted">Đặt lúc <time dateTime={order.created_at}>{formatOrderDate(order.created_at)}</time></p></div>
        <OrderUtilityActions code={order.code} address={order.address} printable={!!items} />
      </header>
      {items && <a href="#order-processing" className="inline-flex min-h-11 self-start items-center rounded-lg border border-brand px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand xl:hidden">Đi tới phần xử lý đơn</a>}
      {order.status !== "cancelled" && <ol aria-label="Tiến trình xử lý đơn" className="grid gap-2 sm:grid-cols-4">
        {ORDER_STATUS_FLOW.map((status,index)=><li key={status} aria-current={index===stage ? "step" : undefined} className={`rounded-lg border p-3 text-sm ${index<=stage ? "border-brand/40 bg-brand/10 text-fg" : "border-ink-700 text-fg-muted"}`}><span className="mr-2 tabular-nums">{index+1}.</span>{ORDER_STATUS_LABEL[status]}{index===stage && <span className="sr-only"> · Bước hiện tại</span>}</li>)}
      </ol>}
      {order.cancellation_reason && <div className="rounded-lg border border-red-400/30 p-4 text-sm text-fg"><strong>Lý do hủy:</strong> {order.cancellation_reason}</div>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className={card} aria-label="Thông tin khách hàng">
            <h2 className="font-semibold text-fg">Khách hàng & giao hàng</h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div><dt className="text-fg-muted">Người nhận</dt><dd className="mt-1 break-words font-medium text-fg">{order.customer_name}</dd></div>
              <div><dt className="text-fg-muted">Điện thoại</dt><dd><a href={`tel:${order.customer_phone}`} className="inline-flex min-h-11 items-center text-fg underline focus-visible:outline-2 focus-visible:outline-brand">{order.customer_phone}</a></dd></div>
              {order.customer_email && <div><dt className="text-fg-muted">Email</dt><dd><a href={`mailto:${order.customer_email}`} className="inline-flex min-h-11 max-w-full items-center break-all text-fg underline focus-visible:outline-2 focus-visible:outline-brand">{order.customer_email}</a></dd></div>}
              <div><dt className="text-fg-muted">Địa chỉ nhận hàng</dt><dd className="mt-1 whitespace-pre-wrap break-words text-fg">{order.address}</dd></div>
              {order.note && <div><dt className="text-fg-muted">Ghi chú của khách</dt><dd className="mt-1 whitespace-pre-wrap break-words text-fg">{order.note}</dd></div>}
            </dl>
          </section>
          <section className={card} aria-label="Sản phẩm trong đơn">
            <h2 className="font-semibold text-fg">Sản phẩm cần kiểm & đóng gói</h2>
            {items ? <ul className="mt-4 flex flex-col gap-4">{items.map((item,index)=><li key={index} className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-700 pb-3 text-sm last:border-0 last:pb-0">
              <div className="min-w-0 flex-1"><p className="break-words font-medium text-fg">{item.name}</p><p className="mt-1 break-words text-fg-muted">Màu {item.color} · Size {item.size} · {item.quantity} đôi</p><p className="mt-1 text-xs text-fg-muted">Đơn giá {formatVND(item.price)}</p></div><span className="shrink-0 tabular-nums text-fg">{formatVND(item.price*item.quantity)}</span>
            </li>)}</ul> : <p role="alert" className="mt-4 text-sm text-red-400">Không đọc được danh sách sản phẩm. Kiểm tra dữ liệu đơn trước khi đóng gói.</p>}
          </section>
          <section className={card} aria-label="Giá trị đơn hàng">
            <h2 className="font-semibold text-fg">Giá trị đơn hàng</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              {[{label:"Tạm tính",value:formatVND(order.subtotal)},{label:"Giảm giá",value:`-${formatVND(order.discount)}`},{label:"Phí vận chuyển",value:formatVND(order.shipping_fee)}].map(row=><div key={row.label} className="flex justify-between gap-3"><dt className="text-fg-muted">{row.label}</dt><dd className="tabular-nums text-fg">{row.value}</dd></div>)}
              <div className="mt-2 flex justify-between gap-3 border-t border-ink-700 pt-3 font-semibold"><dt className="text-fg">Tổng cộng</dt><dd className="tabular-nums text-fg">{formatVND(order.total)}</dd></div>
            </dl><p className="mt-3 text-sm text-fg-muted">COD · {paymentLabel(order.payment_status)}</p>
          </section>
        </div>
        {items ? <OrderProcessingPanel key={order.updated_at} order={order} /> : <div role="alert" className={`${card} text-sm text-red-400`}>Chưa thể xử lý hoặc in phiếu khi dữ liệu sản phẩm bị lỗi.</div>}
      </div>
      <OrderTimeline events={events} createdAt={order.created_at} />
    </div>
    {items && <OrderPrintSlip order={order} items={items} storeName={storeName} />}
  </div>;
}
