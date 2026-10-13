import assert from "node:assert/strict";
import test from "node:test";
import { prepareProductInventory, productInventorySchema, toInventoryInput } from "../src/lib/validation/inventory";
import { getInventoryTotal } from "../src/lib/productVariants";

const colors = [
  { name: "Đen", hex: "#000000", image: "https://example.com/black.webp", inventory: [{ size: 39, quantity: 2 }, { size: 40, quantity: 3 }] },
  { name: "Trắng", hex: "#ffffff", image: "https://example.com/white.webp", inventory: [{ size: 39, quantity: 4 }, { size: 40, quantity: 5 }] },
];

test("inventory update changes exact variants and preserves color names, images and order", () => {
  const input = { colors: [
    { hex: "#FFFFFF", inventory: [{ size: 40, quantity: 0 }, { size: 39, quantity: 4 }] },
    { hex: "#000000", inventory: [{ size: 40, quantity: 3 }, { size: 39, quantity: 10 }] },
  ] };
  const updated = prepareProductInventory(input, colors, [39, 40]);
  assert.deepEqual(updated, [
    { ...colors[0], inventory: [{ size: 39, quantity: 10 }, { size: 40, quantity: 3 }] },
    { ...colors[1], inventory: [{ size: 39, quantity: 4 }, { size: 40, quantity: 0 }] },
  ]);
  assert.equal(getInventoryTotal(updated), 17);
  assert.equal(colors[0].inventory[0].quantity, 2);
});

test("inventory validates integer limits, duplicates and total overflow", () => {
  for (const quantity of [-1, 0.5, NaN, Infinity, 2147483648, "3", null]) {
    assert.equal(productInventorySchema.safeParse({ colors: [{ hex: "#000000", inventory: [{ size: 39, quantity }] }] }).success, false);
  }
  assert.equal(productInventorySchema.safeParse({ colors: [{ hex: "#000000", inventory: [{ size: 39, quantity: 0 }, { size: 40, quantity: 2147483647 }] }] }).success, true);
  assert.equal(productInventorySchema.safeParse({ colors: [{ hex: "#000000", inventory: [{ size: 39, quantity: 2147483647 }, { size: 40, quantity: 1 }] }] }).success, false);
  assert.equal(productInventorySchema.safeParse({ colors: [{ hex: "#000000", inventory: [{ size: 39, quantity: 1 }, { size: 39, quantity: 1 }] }] }).success, false);
  assert.equal(productInventorySchema.safeParse({ colors: [toInventoryInput(colors).colors[0], toInventoryInput(colors).colors[0]] }).success, false);
});

test("inventory cannot add or remove colors or sizes from the persisted product", () => {
  for (const input of [
    { colors: [toInventoryInput(colors).colors[0]] },
    { colors: [toInventoryInput(colors).colors[0], { hex: "#ff0000", inventory: colors[1].inventory }] },
    { colors: [toInventoryInput(colors).colors[0], { hex: "#ffffff", inventory: [{ size: 39, quantity: 1 }] }] },
    { colors: [toInventoryInput(colors).colors[0], { hex: "#ffffff", inventory: [{ size: 39, quantity: 1 }, { size: 41, quantity: 1 }] }] },
  ]) assert.throws(() => prepareProductInventory(input, colors, [39, 40]));
  assert.throws(() => prepareProductInventory(toInventoryInput(colors), colors, []));
});

test("stock-only payload rejects injected product metadata and supports explicit legacy allocation", () => {
  const input = toInventoryInput(colors);
  assert.equal(productInventorySchema.safeParse({ ...input, stock: 999 }).success, false);
  assert.equal(productInventorySchema.safeParse({ colors: [{ ...input.colors[0], image: "https://example.com/changed.webp" }] }).success, false);
  const legacy = colors.map(({ name, hex, image }) => ({ name, hex, image }));
  assert.equal(productInventorySchema.safeParse(toInventoryInput(legacy)).success, false);
  assert.deepEqual(prepareProductInventory(input, legacy, [39, 40]), colors);
});
