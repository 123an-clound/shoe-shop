import type { Json } from "@/types/database";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { paymentLabel } from "@/lib/orderOperations";

export function orderChangeLines(changes: Json) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return [];
  return Object.entries(changes).flatMap(([key, value]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const from = typeof value.from === "string" ? value.from : null;
    const to = typeof value.to === "string" ? value.to : null;
    if (key === "status") return [`${from && isOrderStatus(from) ? ORDER_STATUS_LABEL[from] : "Trạng thái cũ"} → ${to && isOrderStatus(to) ? ORDER_STATUS_LABEL[to] : "Trạng thái mới"}`];
    if (key === "payment_status") return [`Thanh toán: ${paymentLabel(from)} → ${paymentLabel(to)}`];
    if (key === "packed_at") return [to ? "Đã kiểm hàng và đóng gói" : "Bỏ đánh dấu đóng gói"];
    if (key === "shipping_carrier") return [`Hãng vận chuyển: ${to || "Đã xóa"}`];
    if (key === "tracking_number") return [`Mã vận đơn: ${to || "Đã xóa"}`];
    if (key === "internal_note") return ["Đã cập nhật ghi chú nội bộ"];
    if (key === "cancellation_reason") return [`Lý do hủy: ${to || "Đã xóa"}`];
    return [];
  });
}
