"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { settingsFormSchema } from "@/lib/validation/settings";
import { validateUploadedImage } from "@/lib/validation/image";
import { z } from "zod";
import type { ActionResult } from "@/lib/actions/products";
import type { UploadImageResult } from "@/lib/actions/products";

export async function updateSettings(input: unknown, expectedUpdatedAt: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) {
      throw new Error("Phiên bản cấu hình không hợp lệ. Hãy tải lại trang.");
    }
    const parsed = settingsFormSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
    }
    const data = parsed.data;

    const { data: updated, error } = await supabase
      .from("veloce_settings")
      .update({
        store_name: data.storeName,
        slogan: data.slogan,
        slogan_en: data.sloganEn || null,
        hero_headline: data.heroHeadline || null,
        hero_subheadline: data.heroSubheadline || null,
        hero_headline_en: data.heroHeadlineEn || null,
        hero_subheadline_en: data.heroSubheadlineEn || null,
        hero_cta_label_vi: data.heroCtaLabelVi || null,
        hero_cta_label_en: data.heroCtaLabelEn || null,
        announcement_enabled: data.announcementEnabled,
        announcement_text_vi: data.announcementTextVi || null,
        announcement_text_en: data.announcementTextEn || null,
        homepage_sections: data.homepageSections,
        seo_title_vi: data.seoTitleVi || null,
        seo_title_en: data.seoTitleEn || null,
        seo_description_vi: data.seoDescriptionVi || null,
        seo_description_en: data.seoDescriptionEn || null,
        og_image_url: data.ogImageUrl || null,
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
      .eq("id", 1)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Cấu hình đã được người khác thay đổi. Tải lại để xem và áp dụng thay đổi mới nhất.");

    // Tên cửa hàng + màu ảnh hưởng toàn site — làm mới cache + toàn bộ layout gốc (mục 4.9 PLAN.md).
    updateTag("settings");
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
    if (!(file instanceof File) || typeof path !== "string" || !/^branding\/(logo|hero)-[a-f0-9-]{36}\.(png|jpg|webp)$/.test(path)) {
      throw new Error("Thiếu dữ liệu ảnh.");
    }
    const validationError = await validateUploadedImage(file, path);
    if (validationError) throw new Error(validationError);

    const { error } = await supabase.storage
      .from("veloce")
      .upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("veloce").getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
