import assert from "node:assert/strict";
import test from "node:test";
import { getAdminTheme } from "../src/lib/adminTheme";
import { MAX_VIDEO_BYTES, videoValidationError, videoUploadSchema, getProductVideoPath } from "../src/lib/validation/video";

test("admin theme defaults to light and only accepts supported cookie values", () => {
  assert.equal(getAdminTheme(undefined), "light");
  assert.equal(getAdminTheme("invalid"), "light");
  assert.equal(getAdminTheme("light"), "light");
  assert.equal(getAdminTheme("dark"), "dark");
});

test("video uploads require matching container signatures and cap file size at 50 MB", () => {
  const mp4 = new Uint8Array([0,0,0,24,102,116,121,112,105,115,111,109]);
  const webm = new Uint8Array([0x1a,0x45,0xdf,0xa3]);
  assert.equal(videoValidationError("video/mp4", MAX_VIDEO_BYTES, "video.mp4", mp4), null);
  assert.equal(videoValidationError("video/webm", 1000, "video.webm", webm), null);
  assert.ok(videoValidationError("video/mp4", 1000, "video.mp4", webm));
  assert.ok(videoValidationError("video/webm", 1000, "video.mp4", webm));
  assert.ok(videoValidationError("text/html", 1000, "video.mp4", mp4));
  assert.ok(videoValidationError("video/mp4", 0, "video.mp4", mp4));
  assert.ok(videoValidationError("video/mp4", MAX_VIDEO_BYTES + 1, "video.mp4", mp4));
  assert.equal(videoUploadSchema.safeParse({ slug: "giay-mau", type: "video/mp4", size: MAX_VIDEO_BYTES }).success, true);
  assert.equal(videoUploadSchema.safeParse({ slug: "../bad", type: "video/mp4", size: 1000 }).success, false);
});

test("video URLs must reference product videos in the shop bucket on the configured host", () => {
  const host = "https://jtizooyjnllostamffpp.supabase.co";
  const path = "videos/giay-mau-7ea17c74-94be-4ddf-abd1-d40f63d58c37.mp4";
  const url = `${host}/storage/v1/object/public/veloce/${path}`;
  assert.equal(getProductVideoPath(url, host), path);
  for (const invalid of [url.replace(host, "https://attacker.example"), url.replace("/veloce/", "/other-bucket/"), url + "?query=1", url.replace("videos/", "products/"), "javascript:alert(1)"]) {
    assert.equal(getProductVideoPath(invalid, host), null);
  }
});
