import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionOrderStatus, getNextOrderStatuses, isOrderStatus } from "../src/lib/orderStatus";

test("order status changes follow the fulfillment sequence", () => {
  assert.equal(canTransitionOrderStatus("pending", "confirmed"), true);
  assert.equal(canTransitionOrderStatus("confirmed", "shipping"), true);
  assert.equal(canTransitionOrderStatus("shipping", "done"), true);
  assert.equal(canTransitionOrderStatus("pending", "shipping"), false);
  assert.equal(canTransitionOrderStatus("done", "confirmed"), false);
  assert.equal(canTransitionOrderStatus("cancelled", "pending"), false);
});

test("status validation rejects inherited object properties", () => {
  assert.equal(isOrderStatus("__proto__"), false);
  assert.equal(isOrderStatus("toString"), false);
});

test("available transitions do not expose terminal statuses", () => {
  assert.deepEqual(getNextOrderStatuses("pending"), ["confirmed"]);
  assert.deepEqual(getNextOrderStatuses("done"), []);
  assert.deepEqual(getNextOrderStatuses("unknown"), []);
});
