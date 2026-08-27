"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { settingsFormSchema } from "@/lib/validation/settings";
import type { ActionResult } from "@/lib/actions/products";
import type { UploadImageResult } from "@/lib/actions/products";

export async function updateSettings(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = settingsFormSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
    }
    const data = parsed.data;

    const { error } = await supabase
      .from("veloce_settings")
      .update({
        store_name: data.storeName,
        slogan: data.slogan,
        hero_headline: data.heroHeadline || null,
        hero_subheadline: data.heroSubheadline || null,
        logo_url: data.logoUrl || null,
        hero_image_url: data.heroImageUrl || null,
        color_primary: data.colorPrimary,
        color_secondary: data.colorSecondary,
        color_accent: data.colorAccent,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        facebook_url: data.facebookUrl || null,
        instagram_url: data.instagramUrl || null,
        zalo_url: data.zaloUrl || null,
        coupon_code: data.couponCode || null,
        coupon_percent: data.couponPercent,
        freeship_threshold: data.freeshipThreshold,
        shipping_fee: data.shippingFee,
      })
      .eq("id", 1);

    if (error) throw new Error(error.message);

    // Tên cửa hàng + màu ảnh hưởng toàn site — làm mới cache + toàn bộ layout gốc (mục 4.9 PLAN.md).
    revalidateTag("settings", "max");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function uploadSettingsImage(formData: FormData): Promise<UploadImageResult> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("file");
    const path = formData.get("path");
    if (!(file instanceof File) || typeof path !== "string") {
      throw new Error("Thiếu dữ liệu ảnh.");
    }

    const { error } = await supabase.storage
      .from("veloce")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("veloce").getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
