"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { testimonialFormSchema } from "@/lib/validation/testimonial";
import type { ActionResult } from "@/lib/actions/products";

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
      content: data.content,
      rating: data.rating,
      is_published: data.isPublished,
    });
    if (error) throw new Error(error.message);

    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateTestimonial(id: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = parse(input);

    const { error } = await supabase
      .from("veloce_testimonials")
      .update({
        name: data.name,
        role: data.role || null,
        content: data.content,
        rating: data.rating,
        is_published: data.isPublished,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("veloce_testimonials").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
