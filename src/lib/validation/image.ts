const MIME_BY_EXTENSION = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
} as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function validateUploadedImage(file: File, path: string): Promise<string | null> {
  const extension = path.split(".").at(-1)?.toLowerCase() as keyof typeof MIME_BY_EXTENSION | undefined;
  const expectedType = extension ? MIME_BY_EXTENSION[extension] : undefined;

  if (!expectedType || file.type !== expectedType || file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return "Ảnh phải là PNG, JPG hoặc WebP, đúng phần mở rộng và không quá 5 MB.";
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isPng = bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  const isJpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isWebp = bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  const signatureMatches = expectedType === "image/png"
    ? isPng
    : expectedType === "image/jpeg"
      ? isJpeg
      : isWebp;

  return signatureMatches ? null : "Tệp tải lên không khớp với định dạng ảnh đã chọn.";
}
