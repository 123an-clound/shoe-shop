"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatVND, formatTimeAgo } from "@/lib/format";
import { getNextOrderStatuses, ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { cancelOrder, updateOrderStatus } from "@/lib/actions/adminOrders";
import type { Order } from "@/lib/queries/admin";

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  const sorted = [...orders].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return b.created_at.localeCompare(a.created_at);
  });

  async function handleStatusChange(order: Order, status: string) {
    if (pendingOrderId) return;
    setPendingOrderId(order.id);
    try {
      const result = await updateOrderStatus(order.id, status);
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
        return;
      }
      toast.success("Đã cập nhật trạng thái");
      router.refresh();
    } catch {
      toast.error("Không kết nối được. Hãy tải lại để kiểm tra trạng thái đơn.");
      router.refresh();
    } finally {
      setPendingOrderId(null);
    }
  }

  async function handleCancel() {
    if (!cancelTarget || pendingOrderId) return;
    setPendingOrderId(cancelTarget.id);
    try {
      const result = await cancelOrder(cancelTarget.id);
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
        return;
      }
      toast.success("Đã hủy đơn và hoàn kho");
      setCancelTarget(null);
      router.refresh();
    } catch {
      toast.error("Không kết nối được. Hãy tải lại để kiểm tra trạng thái đơn.");
      router.refresh();
    } finally {
      setPendingOrderId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-ink-700">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-ink-900 text-left text-fg-muted">
          <tr>
            <th className="p-3 font-medium">Mã đơn</th>
            <th className="p-3 font-medium">Khách hàng</th>
            <th className="p-3 font-medium">Tổng tiền</th>
            <th className="p-3 font-medium">Thời gian</th>
            <th className="p-3 font-medium">Trạng thái</th>
            <th className="p-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((order) => (
            <tr key={order.id} className="border-t border-ink-700">
              <td className="p-3">
                <Link href={`/admin/don-hang/${order.id}`} className="font-medium text-fg hover:text-brand">
                  {order.code}
                </Link>
              </td>
              <td className="p-3 text-fg-muted">
                {order.customer_name}
                <br />
                <span className="text-xs text-fg-subtle">{order.customer_phone}</span>
              </td>
              <td className="p-3 tabular-nums text-fg">{formatVND(order.total)}</td>
              <td className="p-3 text-fg-subtle">{formatTimeAgo(order.created_at)}</td>
              <td className="p-3">
                {isOrderStatus(order.status) && getNextOrderStatuses(order.status).length > 0 ? (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                    disabled={pendingOrderId !== null}
                    aria-label={`Trạng thái đơn ${order.code}`}
                    className="h-9 rounded-lg border border-ink-700 bg-ink-900 px-2 text-xs text-fg focus:border-brand focus:outline-none disabled:cursor-wait disabled:opacity-60"
                  >
                    {[order.status, ...getNextOrderStatuses(order.status)].map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge tone={order.status === "done" ? "lime" : "muted"}>
                    {isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status}
                  </Badge>
                )}
              </td>
              <td className="p-3">
                {order.status !== "cancelled" && order.status !== "done" && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(order)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Hủy đơn
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <p className="p-6 text-center text-sm text-fg-muted">Chưa có đơn hàng nào.</p>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Hủy đơn hàng"
        description="Tồn kho của các sản phẩm trong đơn sẽ được hoàn lại."
        expectedText={cancelTarget?.code ?? ""}
        confirmLabel="Hủy đơn"
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
