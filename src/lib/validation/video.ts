import { z } from "zod";

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const PRODUCT_VIDEO_PATH_PATTERN = /^videos\/[a-z0-9-]+-[a-f0-9-]{36}\.(mp4|webm)$/;
export const videoUploadSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  type: z.enum(["video/mp4", "video/webm"]),
  size: z.number().int().positive().max(MAX_VIDEO_BYTES, "Video tối đa 50 MB"),
});

export function videoValidationError(type: string, size: number, path: string, bytes: Uint8Array): string | null {
  if (size <= 0 || size > MAX_VIDEO_BYTES || !Number.isFinite(size)) return "Video phải có dung lượng từ 1 byte đến 50 MB.";
  const isMp4 = type === "video/mp4" && path.endsWith(".mp4") && bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  const isWebm = type === "video/webm" && path.endsWith(".webm") && [0x1a, 0x45, 0xdf, 0xa3].every((byte, index) => bytes[index] === byte);
  return isMp4 || isWebm ? null : "Tệp video phải là MP4 hoặc WebM đúng định dạng.";
}

export function getProductVideoPath(value: string, supabaseUrl: string): string | null {
  try {
    const url = new URL(value);
    const base = new URL(supabaseUrl);
    const prefix = "/storage/v1/object/public/veloce/";
    if (url.origin !== base.origin || url.search || url.hash || !url.pathname.startsWith(prefix)) return null;
    const path = url.pathname.slice(prefix.length);
    return PRODUCT_VIDEO_PATH_PATTERN.test(path) ? path : null;
  } catch {
    return null;
  }
}
