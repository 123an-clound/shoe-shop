import assert from "node:assert/strict";
import test from "node:test";
import { cancelOrderSchema, codCollectionAmount, getOrderListHref, isOverdueOrder, normalizeOrderFilters, orderDateBounds, orderPatchSchema, paymentLabel } from "../src/lib/orderOperations";
import { csvCell, ordersToCsv } from "../src/lib/orderExport";
import { orderChangeLines } from "../src/lib/orderHistory";
import { getOrderItems } from "../src/lib/orderItems";

test("order filters sanitize raw queries, reject unknown enum keys and retain URL filters", () => {
  const filters = normalizeOrderFilters({ q: "Nguyễn,(status.eq.done)", status: "__proto__", payment: "constructor", queue: "to_pack", from: "2026-10-01", to: "2026-10-13" });
  assert.equal(filters.search, "Nguyễnstatus.eq.done");
  assert.equal(filters.status, "confirmed");
  assert.equal(filters.payment, "all");
  const url = new URL(getOrderListHref(filters, 3), "https://example.com");
  assert.equal(url.searchParams.get("page"), "3");
  assert.equal(url.searchParams.get("queue"), "to_pack");
  assert.equal(url.searchParams.get("from"), "2026-10-01");
  assert.equal(normalizeOrderFilters({ q: ["hello"], from: "2026-02-30", to: "invalid" }).search, "");
  assert.equal(normalizeOrderFilters({ from: "2026-02-30" }).from, "");
  assert.equal(normalizeOrderFilters({ queue: "to_refund", status: "shipping", payment: "unpaid" }).payment, "paid");
});

test("order date ranges include the entire Vietnam day and flag only overdue pending orders", () => {
  assert.deepEqual(orderDateBounds({ from: "2026-10-13", to: "2026-10-13" }), { from: "2026-10-12T17:00:00.000Z", to: "2026-10-13T17:00:00.000Z" });
  const now = Date.parse("2026-10-13T08:00:00Z");
  assert.equal(isOverdueOrder({ status: "pending", created_at: "2026-10-12T07:59:59Z" }, now), true);
  assert.equal(isOverdueOrder({ status: "shipping", created_at: "2026-10-12T00:00:00Z" }, now), false);
});

test("order update and cancellation inputs reject unknown money fields, invalid steps and missing reasons", () => {
  assert.equal(orderPatchSchema.safeParse({ internal_note: "  Đã gọi khách  ", packed: true }).success, true);
  assert.deepEqual(orderPatchSchema.parse({ internal_note: "  Đã gọi khách  " }), { internal_note: "Đã gọi khách" });
  for (const input of [{}, { total: 1 }, { status: "cancelled" }, { payment_status: "invalid" }, { packed: "true" }, { tracking_number: "x".repeat(101) }, { internal_note: "x".repeat(2001) }]) assert.equal(orderPatchSchema.safeParse(input).success, false);
  const cancel = { id: "00000000-0000-4000-8000-000000000001", updatedAt: "2026-10-13T08:00:00Z", reason: "Khách hủy", goodsReturned: true };
  assert.equal(cancelOrderSchema.safeParse(cancel).success, true);
  assert.equal(cancelOrderSchema.safeParse({ ...cancel, reason: " " }).success, false);
});

test("CSV escapes quotes/newlines and neutralizes spreadsheet formulas including customer phone prefixes", () => {
  assert.equal(csvCell('Khách "A", B'), '"Khách ""A"", B"');
  assert.equal(csvCell("=HYPERLINK(\"https://evil.example\")").startsWith('"\'='), true);
  for (const value of ["+84123456789", " @SUM(A1)", "-1+2", "\tformula", "\nformula"]) assert.equal(csvCell(value)[1], "'");
  const csv = ordersToCsv([{ code: "ORD-1", created_at: "2026-10-13T00:00:00Z", customer_name: "Khách", customer_phone: "0900000000", customer_email: null, address: "Dòng 1\nDòng 2", status: "pending", payment_status: null, total: 500000, shipping_carrier: null, tracking_number: null }]);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.ok(csv.includes("Chưa đối soát"));
  assert.ok(csv.includes('"Dòng 1\nDòng 2"'));
});

test("historical payments never invent a COD amount and paid/cancelled orders cannot collect twice", () => {
  assert.equal(paymentLabel(null), "Chưa đối soát");
  assert.equal(paymentLabel("__proto__"), "Chưa đối soát");
  const order = { status: "shipping", payment_status: "unpaid", total: 500000 };
  assert.equal(codCollectionAmount(order), 500000);
  assert.equal(codCollectionAmount({ ...order, payment_status: "paid" }), 0);
  assert.equal(codCollectionAmount({ ...order, payment_status: null }), null);
  assert.equal(codCollectionAmount({ ...order, status: "cancelled" }), 0);
});

test("timeline decodes only supported changes and item snapshots reject corrupted fulfillment data", () => {
  assert.deepEqual(orderChangeLines({ status: { from: "pending", to: "confirmed" }, internal_note: { from: null, to: "Nội bộ" }, total: { from: 0, to: 1 } }), ["Chờ xử lý → Đã xác nhận", "Đã cập nhật ghi chú nội bộ"]);
  assert.deepEqual(orderChangeLines(null), []);
  assert.equal(getOrderItems({ invalid: true }), null);
  assert.equal(getOrderItems([]), null);
  const item = { product_id: "00000000-0000-4000-8000-000000000001", slug: "giay-mau", name: "Giày", image: "", size: 39, color: "#000000", quantity: 2, price: 500000 };
  assert.deepEqual(getOrderItems([item]), [item]);
  assert.equal(getOrderItems([{ ...item, quantity: -1 }]), null);
});
