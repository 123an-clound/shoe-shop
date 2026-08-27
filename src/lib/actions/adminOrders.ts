"use server";

import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { ORDER_STATUS_FLOW, isOrderStatus } from "@/lib/orderStatus";
import type { ActionResult } from "@/lib/actions/products";

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!isOrderStatus(status) || !ORDER_STATUS_FLOW.includes(status)) {
      throw new Error("Trạng thái không hợp lệ.");
    }

    const { error } = await supabase
      .from("veloce_orders")
      .update({ status })
      .eq("id", orderId);
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

/**
 * Hủy đơn CHỈ qua RPC veloce_cancel_order — hàm này tự hoàn kho, không tự
 * update cột stock hay status từ ứng dụng (mục 4.8/5.7 PLAN.md).
 */
export async function cancelOrder(orderId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("veloce_cancel_order", { p_order_id: orderId });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
