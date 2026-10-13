import { z } from "zod";
import { isOrderStatus, type OrderStatus } from "@/lib/orderStatus";

export const PAYMENT_LABEL = { unpaid: "Chưa thu tiền", paid: "Đã thu tiền", refunded: "Đã hoàn tiền", unrecorded: "Chưa đối soát" } as const;
export type PaymentFilter = "all" | keyof typeof PAYMENT_LABEL;
export const ORDER_QUEUE_LABEL = { all: "Tất cả", overdue: "Chờ quá 24 giờ", to_pack: "Cần đóng gói", to_refund: "Cần hoàn tiền", to_reconcile: "Cần đối soát" } as const;
export type OrderQueue = keyof typeof ORDER_QUEUE_LABEL;
export type OrderFilters = { search: string; status: OrderStatus | "all"; payment: PaymentFilter; from: string; to: string; queue: OrderQueue };
const dateSchema = z.iso.date();
const readString = (value: unknown) => typeof value === "string" ? value : "";

export function normalizeOrderFilters(input: Record<string, unknown> = {}): OrderFilters {
  const rawStatus = readString(input.status);
  const rawPayment = readString(input.payment);
  const rawQueue = readString(input.queue);
  const queue: OrderQueue = Object.hasOwn(ORDER_QUEUE_LABEL, rawQueue) ? rawQueue as OrderQueue : "all";
  let status: OrderFilters["status"] = isOrderStatus(rawStatus) ? rawStatus : "all";
  let payment: PaymentFilter = Object.hasOwn(PAYMENT_LABEL, rawPayment) ? rawPayment as PaymentFilter : "all";
  if (queue === "overdue") status = "pending";
  if (queue === "to_pack") status = "confirmed";
  if (queue === "to_refund") { status = "cancelled"; payment = "paid"; }
  if (queue === "to_reconcile") { status = "done"; payment = "all"; }
  const from = dateSchema.safeParse(input.from).success ? readString(input.from) : "";
  const to = dateSchema.safeParse(input.to).success ? readString(input.to) : "";
  return {
    search: readString(input.q ?? input.search).normalize("NFC").replace(/[^\p{L}\p{N}@+ ._-]/gu, "").trim().slice(0, 60),
    status, payment, queue, from, to,
  };
}

export function orderDateBounds(filters: Pick<OrderFilters, "from" | "to">) {
  const from = filters.from ? new Date(`${filters.from}T00:00:00+07:00`).toISOString() : null;
  const to = filters.to ? new Date(new Date(`${filters.to}T00:00:00+07:00`).getTime() + 86400000).toISOString() : null;
  return { from, to };
}

export function getOrderListHref(filters: OrderFilters, page = 1, path = "/admin/don-hang") {
  const query = new URLSearchParams();
  if (filters.search) query.set("q", filters.search);
  if (filters.status !== "all") query.set("status", filters.status);
  if (filters.payment !== "all") query.set("payment", filters.payment);
  if (filters.queue !== "all") query.set("queue", filters.queue);
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (page > 1) query.set("page", String(page));
  return `${path}${query.size ? `?${query}` : ""}`;
}

export const orderPatchSchema = z.object({
  status: z.enum(["confirmed", "shipping", "done"]).optional(),
  internal_note: z.string().trim().max(2000, "Ghi chú tối đa 2.000 ký tự").optional(),
  shipping_carrier: z.string().trim().max(100, "Tên hãng tối đa 100 ký tự").optional(),
  tracking_number: z.string().trim().max(100, "Mã vận đơn tối đa 100 ký tự").optional(),
  payment_status: z.enum(["unpaid", "paid", "refunded"]).optional(),
  packed: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Không có thay đổi để lưu");
export type OrderPatch = z.infer<typeof orderPatchSchema>;
export const orderVersionSchema = z.object({ id: z.string().uuid(), updatedAt: z.string().datetime({ offset: true }) });
export const cancelOrderSchema = orderVersionSchema.extend({
  reason: z.string().trim().min(3, "Nhập lý do hủy ít nhất 3 ký tự").max(500, "Lý do hủy tối đa 500 ký tự"),
  goodsReturned: z.boolean(),
}).strict();

export function paymentLabel(value: string | null) {
  return value && Object.hasOwn(PAYMENT_LABEL, value) ? PAYMENT_LABEL[value as keyof typeof PAYMENT_LABEL] : PAYMENT_LABEL.unrecorded;
}

export function codCollectionAmount(order: { status: string; payment_status: string | null; total: number }) {
  if (order.status === "cancelled" || order.payment_status === "paid" || order.payment_status === "refunded") return 0;
  return order.payment_status === "unpaid" ? order.total : null;
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function isOverdueOrder(order: { status: string; created_at: string }, now = Date.now()) {
  return order.status === "pending" && now - new Date(order.created_at).getTime() > 86400000;
}

export const orderSummarySchema = z.object({
  pending: z.number(), confirmed: z.number(), shipping: z.number(), done: z.number(), cancelled: z.number(),
  overdue: z.number(), to_pack: z.number(), to_refund: z.number(), to_reconcile: z.number(), today: z.number(),
});
export type OrderSummary = z.infer<typeof orderSummarySchema>;
