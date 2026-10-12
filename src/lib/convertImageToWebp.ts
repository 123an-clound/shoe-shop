const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_EDGE = 2000;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

/** Chuyển ảnh tại máy người dùng trước khi upload, giữ nền trong suốt của PNG. */
export async function convertImageToWebp(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size === 0 || file.size > MAX_SOURCE_BYTES) {
    throw new Error("Chọn ảnh JPG, PNG, WebP hoặc AVIF, tối đa 20 MB.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Không đọc được ảnh. Hãy chọn một tệp ảnh hợp lệ.");
  }
  const canvas = document.createElement("canvas");
  try {
    const ratio = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob || blob.type !== "image/webp") throw new Error("Trình duyệt chưa hỗ trợ chuyển ảnh WebP. Hãy dùng Chrome hoặc Edge mới.");
    const output = file.type === "image/webp" && ratio === 1 && file.size < blob.size ? file : blob;
    if (output.size > MAX_OUTPUT_BYTES) throw new Error("Ảnh sau tối ưu vẫn lớn hơn 5 MB. Hãy chọn ảnh nhỏ hơn.");
    return new File([output], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } finally {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}
