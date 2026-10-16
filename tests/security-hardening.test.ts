import assert from "node:assert/strict";
import test from "node:test";
import { PublicError, databaseError, safeErrorMessage } from "../src/lib/security/errors";
import { authCookieOptions, hardenAuthCookie } from "../src/lib/security/cookies";
import { requestSource, privateSubject } from "../src/lib/security/source";
import { placeOrderInputSchema } from "../src/lib/validation/order";

test("unexpected provider failures are redacted while safe business errors remain readable", () => {
  assert.equal(safeErrorMessage(new PublicError("Chọn lại size.")), "Chọn lại size.");
  const raw = "relation private.secret does not exist; bearer TOKEN password=SECRET C:/database";
  const message = safeErrorMessage(databaseError({ code: "42P01", message: raw }));
  assert.match(message, /Mã hỗ trợ: [a-f0-9-]{36}/);
  for (const value of ["private.secret", "TOKEN", "SECRET", "C:/"]) assert.ok(!message.includes(value));
  assert.ok(!(databaseError({ code: "P0001", message: raw }) instanceof PublicError));
  assert.ok(databaseError({ code: "P0001", message: "Giỏ hàng đang trống" }) instanceof PublicError);
  assert.equal(safeErrorMessage(databaseError({ code: "P0001", message: 'Sản phẩm "Giày A" chỉ còn 2 đôi' })), 'Sản phẩm "Giày A" chỉ còn 2 đôi');
});

test("auth cookies are server-only and secure on HTTPS environments", () => {
  assert.deepEqual(authCookieOptions(true), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 604800 });
  assert.equal(authCookieOptions(false).httpOnly, true);
  assert.equal(authCookieOptions(false).secure, false);
  assert.equal(hardenAuthCookie({ maxAge: 400 * 86400 }, true).maxAge, 604800);
  assert.equal(hardenAuthCookie({ maxAge: 0 }, true).maxAge, 0);
  assert.equal(hardenAuthCookie({ maxAge: 300 }, true).maxAge, 300);
});

test("auth source rejects forged forwarded headers outside a trusted host and hashes identifiers", () => {
  const headers = new Headers({ "x-vercel-forwarded-for": "203.0.113.1", "x-forwarded-for": "198.51.100.1" });
  assert.equal(requestSource(headers, false, true), null);
  assert.equal(requestSource(headers, true, true), "203.0.113.1");
  assert.equal(requestSource(new Headers({ "x-vercel-forwarded-for": "203.0.113.1, 203.0.113.2" }), true, true), null);
  assert.equal(requestSource(new Headers(), false, false), "local-development");
  assert.notEqual(privateSubject("person@example.com", "a".repeat(64)), privateSubject("person@example.com", "b".repeat(64)));
});

test("checkout bounds free text and strips attacker-supplied price and ownership", () => {
  const input = { customerName: "Fixture", customerPhone: "0900000000", address: "Fixture address", expectedUserId: null, idempotencyKey: "00000000-0000-4000-8000-000000000001", receiptToken: "a".repeat(64), items: [{ productId: "00000000-0000-4000-8000-000000000002", size: 39, color: "#000000", quantity: 1 }] };
  for (const patch of [{ note: "x".repeat(2001) }, { couponCode: "x".repeat(65) }, { customerName: "x".repeat(121) }, { address: "x".repeat(501) }]) assert.equal(placeOrderInputSchema.safeParse({ ...input, ...patch }).success, false);
  const result = placeOrderInputSchema.parse({ ...input, total: 1, customer_user_id: "another user", note: "x".repeat(2000) });
  assert.equal("total" in result, false);
  assert.equal("customer_user_id" in result, false);
});
