"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { formatVND, formatTimeAgo } from "@/lib/format";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { isOverdueOrder, paymentLabel } from "@/lib/orderOperations";
import { updateOrderStatus } from "@/lib/actions/adminOrders";
import type { OrderListItem } from "@/lib/queries/adminOrderOperations";

export function OrdersTable({ orders }: { orders: OrderListItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function confirm(order: OrderListItem) {
    if (pendingId) return;
    setPendingId(order.id);
    try {
      const result = await updateOrderStatus(order.id, "confirmed", order.updated_at);
      if (!result.success) { toast.error(result.error); router.refresh(); return; }
      toast.success(`Đã xác nhận ${order.code}`);
      router.refresh();
    } catch { toast.error("Không kết nối được. Làm mới để kiểm tra trạng thái đơn."); router.refresh(); }
    finally { setPendingId(null); }
  }

  function actions(order: OrderListItem) {
    return <div className="flex flex-wrap items-center gap-2">
      <Link href={`/admin/don-hang/${order.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-ink-700 px-3 text-sm text-fg hover:border-brand focus-visible:outline-2 focus-visible:outline-brand" aria-label={`Xử lý đơn ${order.code}`}>Xử lý đơn</Link>
      {order.status === "pending" && <button type="button" disabled={pendingId !== null} onClick={() => confirm(order)} className="min-h-11 rounded-lg bg-brand px-3 text-sm font-medium text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50" aria-label={`Xác nhận đơn ${order.code}`}>{pendingId === order.id ? "Đang xác nhận..." : "Xác nhận"}</button>}
    </div>;
  }

  function status(order: OrderListItem) {
    return <div className="flex flex-col items-start gap-1.5">
      <Badge tone={order.status === "pending" ? "brand" : order.status === "done" ? "lime" : "muted"}>{isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status}</Badge>
      {isOverdueOrder(order) && <span className="text-xs text-amber-400">Chờ quá 24 giờ</span>}
      {order.status === "confirmed" && <span className="text-xs text-fg-muted">{order.packed_at ? "Đã đóng gói" : "Chưa đóng gói"}</span>}
    </div>;
  }

  if (!orders.length) return <div className="rounded-xl border border-ink-700 bg-ink-900 p-8 text-center"><p className="font-medium text-fg">Không có đơn hàng phù hợp</p><p className="mt-2 text-sm text-fg-muted">Thử bỏ bớt bộ lọc hoặc làm mới để nhận đơn mới.</p></div>;

  return <>
    <div className="flex flex-col gap-3 lg:hidden">
      {orders.map((order) => <article key={order.id} className="rounded-xl border border-ink-700 bg-ink-900 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><Link href={`/admin/don-hang/${order.id}`} className="inline-flex min-h-11 items-center font-semibold text-fg underline focus-visible:outline-2 focus-visible:outline-brand">{order.code}</Link><p className="text-xs text-fg-muted">{formatTimeAgo(order.created_at)}</p></div>
          {status(order)}
        </div>
        <p className="mt-3 break-words text-sm text-fg">{order.customer_name}</p>
        <a href={`tel:${order.customer_phone}`} className="inline-flex min-h-11 items-center text-sm text-fg-muted underline focus-visible:outline-2 focus-visible:outline-brand">{order.customer_phone}</a>
        <div className="mb-4 flex flex-wrap justify-between gap-2 text-sm"><span className="font-semibold tabular-nums text-fg">{formatVND(order.total)}</span><span className="text-fg-muted">{paymentLabel(order.payment_status)}</span></div>
        {order.tracking_number && <p className="mb-3 break-all text-xs text-fg-muted">{order.shipping_carrier} · {order.tracking_number}</p>}
        {actions(order)}
      </article>)}
    </div>
    <div className="hidden overflow-x-auto rounded-xl border border-ink-700 lg:block">
      <table className="w-full min-w-[960px] text-sm">
        <caption className="sr-only">Danh sách đơn hàng và trạng thái xử lý</caption>
        <thead className="bg-ink-900 text-left text-fg-muted"><tr>{["Đơn hàng", "Khách hàng", "Trạng thái", "Thanh toán", "Tổng tiền", "Thao tác"].map(label => <th scope="col" key={label} className="p-3 font-medium">{label}</th>)}</tr></thead>
        <tbody>{orders.map((order) => <tr key={order.id} className="border-t border-ink-700">
          <td className="p-3"><Link href={`/admin/don-hang/${order.id}`} className="inline-flex min-h-11 items-center font-semibold text-fg underline focus-visible:outline-2 focus-visible:outline-brand">{order.code}</Link><p className="text-xs text-fg-muted">{formatTimeAgo(order.created_at)}</p>{order.tracking_number && <p className="mt-1 max-w-48 break-all text-xs text-fg-muted">{order.shipping_carrier} · {order.tracking_number}</p>}</td>
          <td className="p-3"><p className="text-fg">{order.customer_name}</p><a href={`tel:${order.customer_phone}`} className="inline-flex min-h-11 items-center text-xs text-fg-muted underline focus-visible:outline-2 focus-visible:outline-brand">{order.customer_phone}</a></td>
          <td className="p-3">{status(order)}</td>
          <td className="p-3 text-fg-muted">{paymentLabel(order.payment_status)}</td>
          <td className="p-3 font-medium tabular-nums text-fg">{formatVND(order.total)}</td>
          <td className="p-3">{actions(order)}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </>;
}
