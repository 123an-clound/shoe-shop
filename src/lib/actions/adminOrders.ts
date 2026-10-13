"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { orderPatchSchema, orderVersionSchema, cancelOrderSchema } from "@/lib/orderOperations";
import type { ActionResult } from "@/lib/actions/products";

export async function updateOrderOperations(orderId: string, expectedUpdatedAt: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!orderVersionSchema.safeParse({ id: orderId, updatedAt: expectedUpdatedAt }).success) throw new Error("Phiên bản đơn không hợp lệ. Tải lại trang.");
    const parsed = orderPatchSchema.safeParse(input);
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu cập nhật không hợp lệ.");
    const { error } = await supabase.rpc("veloce_admin_update_order", { p_order_id: orderId, p_expected_updated_at: expectedUpdatedAt, p_patch: parsed.data });
    if (error) throw new Error(error.message);
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateOrderStatus(orderId: string, status: string, expectedUpdatedAt: string): Promise<ActionResult> {
  return updateOrderOperations(orderId, expectedUpdatedAt, { status });
}

/**
 * Hủy đơn CHỈ qua RPC veloce_cancel_order — hàm này tự hoàn kho, không tự
 * update cột stock hay status từ ứng dụng (mục 4.8/5.7 PLAN.md).
 */
export async function cancelOrder(orderId: string, expectedUpdatedAt: string, reason: string, goodsReturned = false): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const parsed = cancelOrderSchema.safeParse({ id: orderId, updatedAt: expectedUpdatedAt, reason, goodsReturned });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Thông tin hủy đơn không hợp lệ.");
    const { error } = await supabase.rpc("veloce_admin_cancel_order", { p_order_id: orderId, p_expected_updated_at: expectedUpdatedAt, p_reason: parsed.data.reason, p_goods_returned: goodsReturned });
    if (error) throw new Error(error.message);

    updateTag("products");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
