"use server";

import { PublicError, databaseError } from "@/lib/security/errors";

import { updateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { categoryFormSchema } from "@/lib/validation/category";
import type { ActionResult } from "@/lib/actions/products";
import { z } from "zod";

export async function createCategory(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) throw new PublicError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

    const { error } = await supabase.from("veloce_categories").insert(parsed.data);
    if (error) throw databaseError(error);

    updateTag("categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateCategory(categoryId: string, expectedUpdatedAt: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(categoryId).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) throw new PublicError("Phiên bản danh mục không hợp lệ. Hãy tải lại trang.");
    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) throw new PublicError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

    const { data, error } = await supabase
      .from("veloce_categories")
      .update(parsed.data)
      .eq("id", categoryId)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw databaseError(error);
    if (!data) throw new PublicError("Danh mục vừa được thay đổi hoặc đã bị xóa. Tải lại để so sánh trước khi lưu.");

    updateTag("categories");
    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function deleteCategory(categoryId: string, expectedUpdatedAt: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(categoryId).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) throw new PublicError("Phiên bản danh mục không hợp lệ. Hãy tải lại trang.");

    const { count, error: countError } = await supabase
      .from("veloce_products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);
    if (countError) throw new PublicError("Không thể kiểm tra sản phẩm trong danh mục.");

    if (count && count > 0) {
      throw new PublicError(`Không thể xóa — còn ${count} sản phẩm thuộc danh mục này.`);
    }

    const { data, error } = await supabase.from("veloce_categories").delete().eq("id", categoryId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (error) throw databaseError(error);
    if (!data) throw new PublicError("Danh mục vừa được thay đổi hoặc đã bị xóa. Tải lại trang trước khi xóa.");

    updateTag("categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
