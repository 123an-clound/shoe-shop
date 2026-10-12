import assert from "node:assert/strict";
import test from "node:test";
import { validateUploadedImage, validateUploadedWebp } from "../src/lib/validation/image";

test("new uploads accept WebP signatures and reject renamed JPEG/PNG files", async () => {
  const bytes = new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]);
  const webp = new File([bytes], "product.webp", { type: "image/webp" });
  assert.equal(await validateUploadedWebp(webp, "products/pair-10.webp"), null);
  assert.ok(await validateUploadedWebp(new File([new Uint8Array([255,216,255])], "renamed.webp", { type: "image/webp" }), "products/pair-1.webp"));
  assert.ok(await validateUploadedWebp(new File([bytes], "product.png", { type: "image/png" }), "products/pair-1.png"));
});

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
