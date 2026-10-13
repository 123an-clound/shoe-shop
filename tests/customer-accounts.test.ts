import { test } from "node:test";
import assert from "node:assert/strict";
import { addReceipt, parseReceipts, customerOrderSchema, customerOrderScope, orderInScope, customerGroupedHistorySchema } from "../src/lib/customer/orders";
import { normalizePhone, authOrigin, customerCartPath, customerReturnPath, customerReturnHash, checkoutIdentityMatches } from "../src/lib/customer/identity";
import { placeOrderInputSchema } from "../src/lib/validation/order";
import { customerCopy } from "../src/lib/customer/copy";

test("phone login normalizes Vietnamese mobiles and rejects ambiguous numbers", () => {
  assert.equal(normalizePhone("0912 345 678"), "+84912345678");
  assert.equal(normalizePhone("+84 (912) 345-678"), "+84912345678");
  for (const value of ["", "912345678", "+12025550123", "02412345678", "09123456789", "+840912345678", "user@shop.vn"]) assert.equal(normalizePhone(value), null);
});
test("receipt cookies reject corrupt data and retain only five distinct valid receipts", () => {
  const make = (index: number) => ({ id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`, code: `VLC-${index}`, token: "a".repeat(64) });
  assert.deepEqual(parseReceipts("invalid"), []);
  assert.deepEqual(parseReceipts(JSON.stringify([{...make(1), token: "guess"}])), []);
  let entries: ReturnType<typeof parseReceipts> = [];
  for (let index = 0; index < 8; index++) entries = addReceipt(entries, make(index));
  assert.equal(entries.length, 5);
  entries = addReceipt(entries, { ...make(7), token: "b".repeat(64) });
  assert.equal(entries.length, 5);
  assert.equal(entries[0].token, "b".repeat(64));
  assert.deepEqual(parseReceipts(JSON.stringify(entries)), entries);
});
test("OAuth return URLs stay on explicit application origins and fixed cart routes", () => {
  const env = {siteUrl:"https://shop.example",vercelHost:"preview.vercel.app",development:false};
  assert.equal(authOrigin("https://shop.example",env),"https://shop.example");
  assert.equal(authOrigin("https://preview.vercel.app",env),"https://preview.vercel.app");
  for (const value of [null,"https://evil.example","https://shop.example.evil","http://localhost:3000","not-a-url"]) assert.equal(authOrigin(value,env),null);
  assert.equal(authOrigin("http://localhost:3000",{development:true}),"http://localhost:3000");
  assert.equal(customerCartPath("en"),"/en/gio-hang");
  assert.equal(customerCartPath("https://evil.example"),"/gio-hang");
});
test("customer order projection strips internal fields and has translated states", () => {
  const order = customerOrderSchema.parse({ id:"00000000-0000-4000-8000-000000000001",code:"VLC-TEST",created_at:"2026-10-13T01:00:00Z",status:"shipping",items:[{name:"Giày",size:"39",color:"#000000",quantity:1,price:500000}],subtotal:500000,discount:0,shipping_fee:30000,total:530000,shipping_carrier:"GHN",tracking_number:"TEST123",packed_at:null,payment_status:"unpaid",internal_note:"secret",customer_phone:"0912345678" });
  assert.equal("internal_note" in order,false);
  assert.equal("customer_phone" in order,false);
  assert.equal(order.tracking_number,"TEST123");
  for (const locale of ["vi","en"] as const) for (const status of ["pending","confirmed","shipping","done","cancelled"] as const) assert.ok(customerCopy(locale).status[status]);
});
test("checkout requires a strong receipt rather than trusting an order code", () => {
  const input = {customerName:"Khách hàng",customerPhone:"0912345678",address:"Địa chỉ mẫu",expectedUserId:null,idempotencyKey:"00000000-0000-4000-8000-000000000001",items:[{productId:"00000000-0000-4000-8000-000000000002",size:39,color:"#000000",quantity:1}]};
  assert.equal(placeOrderInputSchema.safeParse(input).success,false);
  assert.equal(placeOrderInputSchema.safeParse({...input,receiptToken:"a".repeat(64)}).success,true);
  assert.equal(placeOrderInputSchema.safeParse({...input,receiptToken:"VLC-ABCDEF"}).success,false);
});

test("account return destinations allow only localized cart or checkout", () => {
  assert.equal(customerReturnPath("en", "checkout"), "/en/thanh-toan");
  assert.equal(customerReturnPath("vi", "checkout"), "/thanh-toan");
  assert.equal(customerReturnHash("checkout"), "tai-khoan");
  for (const value of [null, "cart", "//evil.example", "https://evil.example", ["checkout"]]) {
    assert.equal(customerReturnPath("en", value), "/en/gio-hang");
    assert.equal(customerReturnHash(value), "don-hang");
  }
});

test("checkout rejects a different signed-in identity including guest/account switches", () => {
  const a = "00000000-0000-4000-8000-000000000001", b = "00000000-0000-4000-8000-000000000002";
  assert.equal(checkoutIdentityMatches(a, a), true);
  assert.equal(checkoutIdentityMatches(null, null), true);
  for (const [expected, actual] of [[a, b], [null, a], [a, null]]) assert.equal(checkoutIdentityMatches(expected, actual), false);
  const input = { customerName:"Khách hàng", customerPhone:"0912345678", address:"Địa chỉ mẫu", idempotencyKey:a, receiptToken:"a".repeat(64), items:[{productId:b,size:39,color:"#000000",quantity:1}] };
  assert.equal(placeOrderInputSchema.safeParse(input).success, false);
  assert.equal(placeOrderInputSchema.safeParse({ ...input, expectedUserId: "not-a-user" }).success, false);
  assert.equal(placeOrderInputSchema.safeParse({ ...input, expectedUserId: a }).success, true);
});

test("current orders and history cover every state without accepting unknown groups", () => {
  for (const status of ["pending", "confirmed", "shipping"] as const) {
    assert.equal(orderInScope({status}, "active"), true);
    assert.equal(orderInScope({status}, "history"), false);
  }
  for (const status of ["done", "cancelled"] as const) {
    assert.equal(orderInScope({status}, "active"), false);
    assert.equal(orderInScope({status}, "history"), true);
  }
  assert.equal(customerOrderScope("active"), "active");
  assert.equal(customerOrderScope("history"), "history");
  for (const value of [undefined, "SHIPPING", ["active"], "any"]) assert.equal(customerOrderScope(value), "all");
  assert.equal(customerGroupedHistorySchema.safeParse({orders:[], total:0, active_count:0, history_count:0, page:1}).success, true);
  assert.equal(customerGroupedHistorySchema.safeParse({orders:[], total:0, active_count:-1, history_count:0, page:1}).success, false);
});
