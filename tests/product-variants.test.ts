import assert from "node:assert/strict";
import test from "node:test";
import { getColorImage, getInventoryTotal, getVariantStock, hasVariantInventory } from "../src/lib/productVariants";
import { productFormSchema } from "../src/lib/validation/product";

const images = ["https://example.com/black.webp", "https://example.com/white.webp"];
const colors = [
  { name: "Đen", hex: "#000000", image: images[0], inventory: [{ size: 39, quantity: 2 }, { size: 40, quantity: 0 }] },
  { name: "Trắng", hex: "#ffffff", image: images[1], inventory: [{ size: 39, quantity: 0 }, { size: 40, quantity: 7 }] },
];
const product = {
  name: "Giày mẫu", slug: "giay-mau", categoryId: "7ea17c74-94be-4ddf-abd1-d40f63d58c37",
  price: 500000, originalPrice: null, description: "Mô tả sản phẩm giày mẫu.", features: [], featuresEn: [],
  sizes: [39, 40], sizeGuide: [{ size: 39, cm: 24.5 }], colors, images, stock: 99,
  badge: null, isPublished: true, videoUrl: null,
};

test("stock belongs to the exact color and size, including zero and unavailable variants", () => {
  assert.equal(getVariantStock(product, "#000000", 39), 2);
  assert.equal(getVariantStock(product, "#000000", 40), 0);
  assert.equal(getVariantStock(product, "#FFFFFF", 40), 7);
  assert.equal(getVariantStock(product, "#ffffff", 41), 0);
  assert.equal(getVariantStock(product, "#ff0000", 39), 0);
  assert.equal(getVariantStock(product, null, 39), 0);
  assert.equal(getVariantStock(product, "#ffffff", null), 0);
  assert.equal(getInventoryTotal(colors), 9);
});

test("legacy stock remains unallocated rather than being duplicated into each variant", () => {
  const legacyColors = colors.map(({ name, hex }) => ({ name, hex }));
  assert.equal(hasVariantInventory(legacyColors), false);
  assert.equal(getVariantStock({ ...product, colors: legacyColors }, "#000000", 39), 99);
  assert.equal(getVariantStock({ ...product, colors: [colors[0], legacyColors[1]] }, "#ffffff", 39), 0);
});

test("representative image is tied to its URL and survives reorder; removed images fall back", () => {
  assert.equal(getColorImage(images, colors, "#ffffff"), images[1]);
  assert.equal(getColorImage([...images].reverse(), colors, "#000000"), images[0]);
  assert.equal(getColorImage([images[0]], colors, "#ffffff"), images[0]);
  assert.equal(getColorImage([], colors, "#ffffff"), "");
});

test("variant validation rejects invalid quantities, duplicates, partial inventory and unrelated images", () => {
  assert.equal(productFormSchema.safeParse(product).success, true);
  for (const quantity of [-1, 1.5, NaN, Infinity, 2147483648]) {
    assert.equal(productFormSchema.safeParse({ ...product, colors: [{ ...colors[0], inventory: [{ size: 39, quantity }, { size: 40, quantity: 0 }] }] }).success, false);
  }
  for (const invalidColors of [
    [colors[0], { ...colors[1], hex: "#000000" }],
    [colors[0], { ...colors[1], inventory: undefined }],
    [{ ...colors[0], inventory: [{ size: 39, quantity: 1 }, { size: 39, quantity: 2 }] }],
    [{ ...colors[0], inventory: [{ size: 39, quantity: 1 }, { size: 41, quantity: 2 }] }],
    [{ ...colors[0], image: "https://example.com/unrelated.webp" }],
    [{ ...colors[0], inventory: [{ size: 39, quantity: 2147483647 }, { size: 40, quantity: 1 }] }],
  ]) assert.equal(productFormSchema.safeParse({ ...product, colors: invalidColors }).success, false);
  assert.equal(productFormSchema.safeParse({ ...product, sizes: [39, 39] }).success, false);
});
