import assert from "node:assert/strict";
import test from "node:test";
import { validateUploadedImage } from "../src/lib/validation/image";

test("image uploads require the file signature to match the declared format", async () => {
  const fakePng = new File(["<html>not an image</html>"], "product.png", { type: "image/png" });
  assert.match((await validateUploadedImage(fakePng, "products/pair-1.png")) ?? "", /không khớp/i);

  const mismatchedPath = new File([new Uint8Array([255, 216, 255])], "product.png", { type: "image/jpeg" });
  assert.match((await validateUploadedImage(mismatchedPath, "products/pair-1.png")) ?? "", /phần mở rộng/i);
});

test("upload validation rejects empty and oversized images", async () => {
  const empty = new File([], "empty.webp", { type: "image/webp" });
  const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.webp", { type: "image/webp" });
  assert.ok(await validateUploadedImage(empty, "branding/hero.webp"));
  assert.ok(await validateUploadedImage(oversized, "branding/hero.webp"));
});
