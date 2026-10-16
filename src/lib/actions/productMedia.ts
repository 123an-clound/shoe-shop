"use server";

import { PublicError } from "@/lib/security/errors";

import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { PRODUCT_VIDEO_PATH_PATTERN, VIDEO_UPLOAD_BUCKET, videoUploadSchema } from "@/lib/validation/video";
import { verifyStagedProductVideo } from "@/lib/productVideo";
import type { UploadImageResult } from "@/lib/actions/products";
import { checkAuthRate } from "@/lib/auth/rateLimit";

export async function createProductVideoUpload(input: unknown): Promise<
  { success: true; path: string; token: string } | { success: false; error: string }
> {
  try {
    const { supabase, user } = await requireAdmin();
    if (await checkAuthRate(supabase, "media-upload", user.id) !== "allowed") throw new PublicError("Chưa thể tải thêm video. Hãy thử lại sau.");
    const parsed = videoUploadSchema.safeParse(input);
    if (!parsed.success) throw new PublicError("Chọn video MP4/WebM tối đa 50 MB và nhập tên sản phẩm trước.");
    const { slug, type } = parsed.data;
    const path = `videos/${slug}-${crypto.randomUUID()}.${type === "video/mp4" ? "mp4" : "webm"}`;
    const { data, error } = await supabase.storage.from(VIDEO_UPLOAD_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new PublicError("Không tạo được phiên tải video. Hãy thử lại.");
    return { success: true, path: data.path, token: data.token };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function completeProductVideoUpload(path: string): Promise<UploadImageResult> {
  try {
    const { supabase } = await requireAdmin();
    if (typeof path !== "string" || !PRODUCT_VIDEO_PATH_PATTERN.test(path)) throw new PublicError("Đường dẫn video không hợp lệ.");
    try {
      await verifyStagedProductVideo(path, supabase);
    } catch (error) {
      await supabase.storage.from(VIDEO_UPLOAD_BUCKET).remove([path]);
      throw error;
    }
    const { error: moveError } = await supabase.storage.from(VIDEO_UPLOAD_BUCKET).move(path, path, { destinationBucket: "veloce" });
    if (moveError) throw new PublicError("Không công bố được video đã xác minh. Hãy thử lại.");
    const { data } = supabase.storage.from("veloce").getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
