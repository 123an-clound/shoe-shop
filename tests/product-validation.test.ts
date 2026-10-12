import assert from "node:assert/strict";
import test from "node:test";
import { productFormSchema } from "../src/lib/validation/product";
import { DEFAULT_SIZE_GUIDE, getSizeGuide, sizeGuideSchema } from "../src/lib/sizeGuide";
import { PRODUCT_IMAGE_PATH_PATTERN } from "../src/lib/validation/image";

const product = {
  name: "Giày mẫu",
  slug: "giay-mau",
  categoryId: "7ea17c74-94be-4ddf-abd1-d40f63d58c37",
  price: 500000,
  originalPrice: null,
  description: "Mô tả sản phẩm giày mẫu.",
  features: [],
  featuresEn: [],
  sizes: [39, 40],
  sizeGuide: [{ size: 39, cm: 24.5 }, { size: 40, cm: 25 }],
  colors: [{ name: "Đen", hex: "#000000" }],
  badge: null,
  stock: 10,
  isPublished: false,
  images: [],
  videoUrl: null,
};

test("products accept up to ten images and reject an eleventh", () => {
  for (const count of [0, 3, 5, 9, 10]) {
    const images = Array.from({ length: count }, (_, index) => `https://example.com/${index}.webp`);
    assert.equal(productFormSchema.safeParse({ ...product, images }).success, true);
  }
  const result = productFormSchema.safeParse({ ...product, images: Array(11).fill("https://example.com/image.webp") });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.issues[0].message, "Tối đa 10 ảnh");
});

test("upload paths allow ten WebP slots and reject other formats, invalid slots and traversal", () => {
  const id = "7ea17c74-94be-4ddf-abd1-d40f63d58c37";
  for (const slot of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    assert.equal(PRODUCT_IMAGE_PATH_PATTERN.test(`products/giay-mau-${slot}-${id}.webp`), true);
  }
  for (const path of [`products/giay-mau-0-${id}.webp`, `products/giay-mau-11-${id}.webp`, `products/../giay-mau-1-${id}.webp`, `products/giay-mau-1-${id}.png`, `products/giay-mau-1-${id}.jpg`]) {
    assert.equal(PRODUCT_IMAGE_PATH_PATTERN.test(path), false);
  }
});

test("size guide validation rejects duplicate sizes, missing rows and invalid measurements", () => {
  const invalid = [
    [],
    [{ size: 39, cm: 24.5 }, { size: 39, cm: 25 }],
    [{ size: 0, cm: 25 }],
    [{ size: 39.5, cm: 25 }],
    [{ size: 61, cm: 25 }],
    [{ size: 39, cm: 0 }],
    [{ size: 39, cm: -1 }],
    [{ size: 39, cm: 51 }],
    [{ size: 39, cm: 24.55 }],
    [{ size: 39, cm: Number.NaN }],
    [{ size: 39, cm: Number.POSITIVE_INFINITY }],
    [{ size: 39, cm: "25" }],
  ];
  for (const sizeGuide of invalid) {
    assert.equal(productFormSchema.safeParse({ ...product, sizeGuide }).success, false);
  }
  const duplicate = sizeGuideSchema.safeParse([{ size: 39, cm: 24.5 }, { size: 39, cm: 25 }]);
  if (!duplicate.success) assert.deepEqual(duplicate.error.issues[0].path, [1, "size"]);
});

test("each product keeps its own measurements and legacy products retain the existing guide", () => {
  assert.deepEqual(getSizeGuide(null), DEFAULT_SIZE_GUIDE);
  assert.deepEqual(getSizeGuide(undefined), DEFAULT_SIZE_GUIDE);
  assert.deepEqual(getSizeGuide({ invalid: true }), DEFAULT_SIZE_GUIDE);
  const custom = [{ size: 42, cm: 27.1 }, { size: 39, cm: 23.8 }];
  assert.deepEqual(getSizeGuide(custom), [{ size: 39, cm: 23.8 }, { size: 42, cm: 27.1 }]);
  assert.deepEqual(custom, [{ size: 42, cm: 27.1 }, { size: 39, cm: 23.8 }]);
  const fallback = getSizeGuide(null);
  fallback[0].cm = 1;
  assert.equal(getSizeGuide(null)[0].cm, 24.5);
});
