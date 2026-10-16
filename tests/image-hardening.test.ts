import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { prepareUploadedImage } from "../src/lib/security/image";

test("image boundary decodes and re-encodes valid WebP while rejecting a signature-only file", async () => {
  const input = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).webp().toBuffer();
  const result = await prepareUploadedImage(new File([new Uint8Array(input)], "image.webp", { type: "image/webp" }));
  assert.equal((await sharp(result).metadata()).format, "webp");
  const forged = new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80]);
  await assert.rejects(prepareUploadedImage(new File([forged], "forged.webp", { type: "image/webp" })), /Không đọc được/);
});
