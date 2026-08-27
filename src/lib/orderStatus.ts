export type OrderStatus = "pending" | "confirmed" | "shipping" | "done" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "done",
];

export function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_LABEL;
}
