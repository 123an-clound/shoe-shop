"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import type { ActionResult } from "@/lib/actions/products";
import { z } from "zod";

const idSchema = z.string().uuid();
const timestampSchema = z.string().datetime({ offset: true });

export async function updateContactMessageStatus(
  id: string,
  expectedUpdatedAt: string,
  status: "new" | "read" | "archived",
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!idSchema.safeParse(id).success || !timestampSchema.safeParse(expectedUpdatedAt).success || !["new", "read", "archived"].includes(status)) {
      throw new Error("Dữ liệu cập nhật không hợp lệ.");
    }
    const { data, error } = await supabase
      .from("veloce_contact_messages")
      .update({ status })
      .eq("id", id)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw new Error("Không cập nhật được trạng thái tin nhắn.");
    if (!data) throw new Error("Tin nhắn vừa được cập nhật ở nơi khác. Hãy tải lại trước khi sửa tiếp.");
    revalidatePath("/admin/hop-thu");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateNewsletterStatus(
  id: string,
  expectedUpdatedAt: string,
  status: "active" | "unsubscribed",
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!idSchema.safeParse(id).success || !timestampSchema.safeParse(expectedUpdatedAt).success || !["active", "unsubscribed"].includes(status)) {
      throw new Error("Dữ liệu cập nhật không hợp lệ.");
    }
    const { data, error } = await supabase
      .from("veloce_newsletter_subscribers")
      .update({ status })
      .eq("id", id)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw new Error("Không cập nhật được trạng thái email.");
    if (!data) throw new Error("Email vừa được cập nhật ở nơi khác. Hãy tải lại trước khi sửa tiếp.");
    revalidatePath("/admin/hop-thu");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
