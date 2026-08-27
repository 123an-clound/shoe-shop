"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { categoryFormSchema } from "@/lib/validation/category";
import type { ActionResult } from "@/lib/actions/products";

export async function createCategory(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

    const { error } = await supabase.from("veloce_categories").insert(parsed.data);
    if (error) throw new Error(error.message);

    revalidateTag("categories", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateCategory(categoryId: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = categoryFormSchema.safeParse(input);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");

    const { error } = await supabase
      .from("veloce_categories")
      .update(parsed.data)
      .eq("id", categoryId);
    if (error) throw new Error(error.message);

    revalidateTag("categories", "max");
    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { count } = await supabase
      .from("veloce_products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (count && count > 0) {
      throw new Error(`Không thể xóa — còn ${count} sản phẩm thuộc danh mục này.`);
    }

    const { error } = await supabase.from("veloce_categories").delete().eq("id", categoryId);
    if (error) throw new Error(error.message);

    revalidateTag("categories", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
