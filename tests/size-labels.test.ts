import assert from "node:assert/strict";
import test from "node:test";
import { formatFootLength, getSizeGuide, getSizeLabel, sizeGuideSchema } from "../src/lib/sizeGuide";
import { getOrderItems } from "../src/lib/orderItems";
import { getVariantStock } from "../src/lib/productVariants";

test("paired sizes retain the exact source label and centimetre range", () => {
  const guide = [{ size: 24, label: "24-25/15-15,5cm", cm: 15, cmMax: 15.5 }];
  assert.deepEqual(getSizeGuide(guide), guide);
  assert.equal(getSizeLabel(guide, 24), "24-25/15-15,5cm");
  assert.equal(formatFootLength(guide[0]), "15.0–15.5 cm");
  assert.equal(getSizeLabel(guide, 26), "26");
  assert.equal(getSizeLabel(null, 39), "39");
});

test("unknown measurements remain unknown instead of using a men's size chart", () => {
  const guide = [{ size: 18, label: "18-19" }];
  assert.deepEqual(getSizeGuide(guide), guide);
  assert.equal(formatFootLength(guide[0]), "—");
  assert.equal(sizeGuideSchema.safeParse([{ size: 18 }]).success, false);
});

test("invalid ranges and duplicate variant keys are rejected", () => {
  for (const guide of [
    [{ size: 24, cm: 15, cmMax: 14 }],
    [{ size: 24, label: "24-25", cmMax: 15.5 }],
    [{ size: 24, label: "24-25" }, { size: 24, label: "24" }],
    [{ size: 24, label: "a".repeat(121) }],
  ]) assert.equal(sizeGuideSchema.safeParse(guide).success, false);
});

test("order snapshots keep a readable label without replacing the stock key", () => {
  const item = { product_id: "7ea17c74-94be-4ddf-abd1-d40f63d58c37", slug: "giay-be", name: "Giày bé", price: 49000, image: "", size: "24", color: "#111111", quantity: 1, size_label: "24-25/15-15,5cm" };
  assert.deepEqual(getOrderItems([item])?.[0], item);
  const { size_label: ignored, ...legacy } = item;
  assert.ok(ignored);
  assert.deepEqual(getOrderItems([legacy])?.[0], legacy);
});

test("a paired size remains one SKU and cannot borrow another size's stock", () => {
  const product = { sizes: [24, 26], stock: 13, colors: [{ name: "Đỏ", hex: "#ff0000", inventory: [{ size: 24, quantity: 5 }, { size: 26, quantity: 8 }] }] };
  assert.equal(getVariantStock(product, "#ff0000", 24), 5);
  assert.equal(getVariantStock(product, "#ff0000", 25), 0);
  assert.equal(getVariantStock(product, "#ff0000", 26), 8);
});
