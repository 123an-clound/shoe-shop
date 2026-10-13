import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { formatOrderDate, paymentLabel } from "@/lib/orderOperations";

export function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+\-@]|^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

type ExportOrder = { code: string; created_at: string; customer_name: string; customer_phone: string; customer_email: string | null; address: string; status: string; payment_status: string | null; total: number; shipping_carrier: string | null; tracking_number: string | null };

export function ordersToCsv(orders: ExportOrder[]) {
  const headers = ["Mã đơn", "Ngày đặt (giờ Việt Nam)", "Khách hàng", "Điện thoại", "Email", "Địa chỉ", "Trạng thái", "Thanh toán", "Tổng tiền (VND)", "Hãng vận chuyển", "Mã vận đơn"];
  const rows = orders.map((order) => [order.code, formatOrderDate(order.created_at), order.customer_name, order.customer_phone, order.customer_email, order.address, isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status, paymentLabel(order.payment_status), order.total, order.shipping_carrier, order.tracking_number]);
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
