import { test } from "node:test";
import assert from "node:assert/strict";
import { readFilters, writeFilters } from "../src/lib/productFilters";
const categories = [{ id: "a", slug: "sneaker" }];
const bounds: [number, number] = [100, 1000];
test("filters round-trip every selection and preserve unrelated query parameters", () => {
  const selected = readFilters("danh-muc=sneaker&min=200&max=800&size=39,40&color=%23AABBCC&sale=1&sort=gia-giam", categories, bounds);
  const encoded = writeFilters("utm_source=test", selected, categories, bounds);
  assert.equal(new URLSearchParams(encoded).get("utm_source"), "test");
  assert.deepEqual(readFilters(encoded, categories, bounds), selected);
});
test("untrusted filter URLs cannot inject sort keys, invalid colors or unbounded prices", () => {
  const filters = readFilters("sort=__proto__&danh-muc=unknown&min=999999&max=-3&size=39,39,NaN&color=red,%23ffffff", categories, bounds);
  assert.equal(filters.sort, "noi-bat"); assert.equal(filters.category, null);
  assert.deepEqual(filters.priceRange, [1000, 1000]);
  assert.deepEqual(filters.sizes, [39]); assert.deepEqual(filters.colors, ["#ffffff"]);
});
