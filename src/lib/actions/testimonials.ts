"use server";

import { updateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { testimonialFormSchema } from "@/lib/validation/testimonial";
import type { ActionResult } from "@/lib/actions/products";
import { z } from "zod";

function parse(input: unknown) {
  const parsed = testimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  return parsed.data;
}

export async function createTestimonial(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = parse(input);

    const { error } = await supabase.from("veloce_testimonials").insert({
      name: data.name,
      role: data.role || null,
      role_en: data.roleEn || null,
      content: data.content,
      content_en: data.contentEn || null,
      rating: data.rating,
      is_published: data.isPublished,
    });
    if (error) throw new Error(error.message);

    updateTag("testimonials");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateTestimonial(id: string, expectedUpdatedAt: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(id).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) throw new Error("Phiên bản đánh giá không hợp lệ. Hãy tải lại trang.");
    const data = parse(input);

    const { data: updated, error } = await supabase
      .from("veloce_testimonials")
      .update({
        name: data.name,
        role: data.role || null,
        role_en: data.roleEn || null,
        content: data.content,
        content_en: data.contentEn || null,
        rating: data.rating,
        is_published: data.isPublished,
      })
      .eq("id", id)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Đánh giá vừa được thay đổi hoặc đã bị xóa. Tải lại để so sánh trước khi lưu.");

    updateTag("testimonials");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function deleteTestimonial(id: string, expectedUpdatedAt: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(id).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) throw new Error("Phiên bản đánh giá không hợp lệ. Hãy tải lại trang.");
    const { data, error } = await supabase.from("veloce_testimonials").delete().eq("id", id).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Đánh giá vừa được thay đổi hoặc đã bị xóa. Tải lại trang trước khi xóa.");

    updateTag("testimonials");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
