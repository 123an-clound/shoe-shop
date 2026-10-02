"use server";

import { updateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { canTransitionOrderStatus, isOrderStatus } from "@/lib/orderStatus";
import type { ActionResult } from "@/lib/actions/products";
import { z } from "zod";

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    if (!z.string().uuid().safeParse(orderId).success || !isOrderStatus(status)) {
      throw new Error("Trạng thái hoặc mã đơn không hợp lệ.");
    }

    const { data: current, error: readError } = await supabase
      .from("veloce_orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    if (readError) throw new Error("Không đọc được trạng thái đơn hàng.");
    if (!current) throw new Error("Không tìm thấy đơn hàng.");
    if (!canTransitionOrderStatus(current.status, status)) {
      throw new Error("Trạng thái này không thể chuyển tiếp từ trạng thái hiện tại.");
    }

    const { data: updated, error } = await supabase
      .from("veloce_orders")
      .update({ status })
      .eq("id", orderId)
      .eq("status", current.status)
      .select("id")
      .maybeSingle();
    if (error) throw new Error("Không thể cập nhật trạng thái đơn hàng.");
    if (!updated) {
      throw new Error("Đơn hàng vừa được người khác cập nhật. Hãy tải lại để xem trạng thái mới.");
    }

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
    if (!z.string().uuid().safeParse(orderId).success) {
      throw new Error("Mã đơn hàng không hợp lệ.");
    }
    const { error } = await supabase.rpc("veloce_cancel_order", { p_order_id: orderId });
    if (error) throw new Error("Không thể hủy đơn hàng. Hãy tải lại và kiểm tra trạng thái hiện tại.");

    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
