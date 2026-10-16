import sharp from "sharp";
import { PublicError } from "./errors";

/** Decode/re-encode ở server; magic bytes không đủ để tin nội dung client. */
export async function prepareUploadedImage(file: File): Promise<Buffer> {
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 20_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (metadata.format !== "webp" || !metadata.width || !metadata.height || metadata.width > 8192 || metadata.height > 8192 || (metadata.pages ?? 1) > 1) {
      throw new PublicError("Ảnh WebP không hợp lệ hoặc vượt kích thước cho phép.");
    }
    const result = await image.rotate().webp({ quality: 90 }).toBuffer();
    if (result.length > 5 * 1024 * 1024) throw new PublicError("Ảnh sau xử lý vượt 5 MB.");
    return result;
  } catch (error) {
    if (error instanceof PublicError) throw error;
    throw new PublicError("Không đọc được nội dung ảnh. Hãy chọn ảnh WebP hợp lệ.");
  }
}
