import { z } from "zod";

export const receiptSchema = z.object({ id: z.string().uuid(), code: z.string().max(40), token: z.string().regex(/^[0-9a-f]{64}$/) });
export type OrderReceipt = z.infer<typeof receiptSchema>;
export function parseReceipts(value?: string): OrderReceipt[] {
  try { return z.array(receiptSchema).max(5).parse(JSON.parse(value || "[]")); } catch { return []; }
}
export function addReceipt(existing: OrderReceipt[], receipt: OrderReceipt): OrderReceipt[] {
  return [receiptSchema.parse(receipt), ...existing.filter((item) => item.id !== receipt.id)].slice(0, 5);
}

export const customerOrderSchema = z.object({
  id: z.string().uuid(), code: z.string(), created_at: z.string(),
  status: z.enum(["pending", "confirmed", "shipping", "done", "cancelled"]),
  items: z.array(z.object({ name: z.string(), size: z.union([z.string(), z.number()]), size_label: z.string().min(1).max(120).optional(), color: z.string(), quantity: z.number(), price: z.number() })),
  subtotal: z.number(), discount: z.number(), shipping_fee: z.number(), total: z.number(),
  shipping_carrier: z.string().nullable(), tracking_number: z.string().nullable(), packed_at: z.string().nullable(),
  payment_status: z.enum(["unpaid", "paid", "refunded"]).nullable(),
});
export type CustomerOrder = z.infer<typeof customerOrderSchema>;
export const customerHistorySchema = z.object({ orders: z.array(customerOrderSchema), total: z.number().int().nonnegative() });
export const customerGroupedHistorySchema = customerHistorySchema.extend({ active_count: z.number().int().nonnegative(), history_count: z.number().int().nonnegative(), page: z.number().int().min(1).max(10000) });
export type CustomerOrderScope = "all" | "active" | "history";
export function customerOrderScope(value: unknown): CustomerOrderScope { return value === "active" || value === "history" ? value : "all"; }
export function orderInScope(order: Pick<CustomerOrder, "status">, scope: CustomerOrderScope): boolean {
  const active = ["pending", "confirmed", "shipping"].includes(order.status);
  return scope === "all" || (scope === "active" ? active : !active);
}
