import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getProductVideoPath, videoValidationError } from "@/lib/validation/video";

/** Kiểm tra file trên Storage trước khi ghi URL vào sản phẩm; không tin metadata từ client. */
export async function verifyStoredProductVideo(value: string | null, supabase: SupabaseClient<Database>) {
  if (!value) return;
  const path = getProductVideoPath(value, process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (!path) throw new Error("Video phải được tải lên từ trình quản lý sản phẩm.");
  const { data, error } = await supabase.storage.from("veloce").info(path);
  if (error || !data) throw new Error("Không đọc được video đã tải lên. Hãy thử lại.");
  const response = await fetch(value, { headers: { Range: "bytes=0-11" }, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok || !response.body) throw new Error("Không kiểm tra được định dạng video.");
  const reader = response.body.getReader();
  const header = new Uint8Array(12);
  let length = 0;
  try {
    while (length < header.length) {
      const { value: chunk, done } = await reader.read();
      if (done) break;
      const part = chunk.subarray(0, header.length - length);
      header.set(part, length);
      length += part.length;
    }
  } finally {
    await reader.cancel();
  }
  const validationError = videoValidationError(data.contentType ?? "", data.size ?? 0, path, header.subarray(0, length));
  if (validationError) throw new Error(validationError);
}
