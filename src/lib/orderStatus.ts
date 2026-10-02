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

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["confirmed"],
  confirmed: ["shipping"],
  shipping: ["done"],
  done: [],
  cancelled: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return Object.hasOwn(ORDER_STATUS_LABEL, value);
}

export function canTransitionOrderStatus(current: string, next: string): boolean {
  return isOrderStatus(current) && isOrderStatus(next) && ORDER_STATUS_TRANSITIONS[current].includes(next);
}

export function getNextOrderStatuses(current: string): OrderStatus[] {
  return isOrderStatus(current) ? [...ORDER_STATUS_TRANSITIONS[current]] : [];
}
