import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/queries/admin";
import { formatVND } from "@/lib/format";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { Badge } from "@/components/ui/Badge";
import type { OrderItem } from "@/types";

export const metadata = { title: "Chi tiết đơn hàng — Quản trị" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const items = order.items as unknown as OrderItem[];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-fg">{order.code}</h1>
        <Badge tone={order.status === "pending" ? "brand" : "muted"}>
          {isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 p-5">
          <h2 className="font-medium text-fg">Khách hàng</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">Họ tên</dt>
              <dd className="text-fg">{order.customer_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Điện thoại</dt>
              <dd className="text-fg">{order.customer_phone}</dd>
            </div>
            {order.customer_email && (
              <div className="flex justify-between">
                <dt className="text-fg-muted">Email</dt>
                <dd className="text-fg">{order.customer_email}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-fg-muted">Địa chỉ</dt>
              <dd className="text-right text-fg">{order.address}</dd>
            </div>
            {order.note && (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-fg-muted">Ghi chú</dt>
                <dd className="text-right text-fg">{order.note}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 p-5">
          <h2 className="font-medium text-fg">Thanh toán</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">Tạm tính</dt>
              <dd className="tabular-nums text-fg">{formatVND(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Giảm giá</dt>
              <dd className="tabular-nums text-fg">-{formatVND(order.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Phí vận chuyển</dt>
              <dd className="tabular-nums text-fg">{formatVND(order.shipping_fee)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-700 pt-2 font-medium">
              <dt className="text-fg">Tổng cộng</dt>
              <dd className="tabular-nums text-fg">{formatVND(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 p-5">
        <h2 className="font-medium text-fg">Sản phẩm</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">
                {item.name} · {item.color} · Size {item.size} × {item.quantity}
              </span>
              <span className="tabular-nums text-fg">
                {formatVND(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
