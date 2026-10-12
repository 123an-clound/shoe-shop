"use server";

import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { PRODUCT_VIDEO_PATH_PATTERN, videoUploadSchema } from "@/lib/validation/video";
import { verifyStoredProductVideo } from "@/lib/productVideo";
import type { UploadImageResult } from "@/lib/actions/products";

export async function createProductVideoUpload(input: unknown): Promise<
  { success: true; path: string; token: string } | { success: false; error: string }
> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = videoUploadSchema.safeParse(input);
    if (!parsed.success) throw new Error("Chọn video MP4/WebM tối đa 50 MB và nhập tên sản phẩm trước.");
    const { slug, type } = parsed.data;
    const path = `videos/${slug}-${crypto.randomUUID()}.${type === "video/mp4" ? "mp4" : "webm"}`;
    const { data, error } = await supabase.storage.from("veloce").createSignedUploadUrl(path);
    if (error || !data) throw new Error("Không tạo được phiên tải video. Hãy thử lại.");
    return { success: true, path: data.path, token: data.token };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function completeProductVideoUpload(path: string): Promise<UploadImageResult> {
  try {
    const { supabase } = await requireAdmin();
    if (typeof path !== "string" || !PRODUCT_VIDEO_PATH_PATTERN.test(path)) throw new Error("Đường dẫn video không hợp lệ.");
    const { data } = supabase.storage.from("veloce").getPublicUrl(path);
    await verifyStoredProductVideo(data.publicUrl, supabase);
    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
