"use server";

import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { placeOrderInputSchema } from "@/lib/validation/order";
import { saveReceipt } from "@/lib/customer/receipts";
import { verifyCustomerSession } from "@/lib/customer/session";
import { checkoutIdentityMatches } from "@/lib/customer/identity";

export type PlaceOrderResult =
  | { success: true; orderCode: string; orderTotal: number }
  | { success: false; error: string };

/**
 * Con đường DUY NHẤT tạo đơn — luôn qua RPC `veloce_place_order` (mục 4.8 PLAN.md).
 * RPC tự khóa hàng, kiểm tra tồn kho/size, tính tiền từ dữ liệu server. Không bao giờ
 * insert thẳng vào veloce_orders hay tự trừ cột stock từ ứng dụng.
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = placeOrderInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dữ liệu đặt hàng không hợp lệ.",
    };
  }

  const supabase = await createClient();
  const session = await verifyCustomerSession(supabase);
  if (session.error) return { success: false, error: "Chưa xác minh được tài khoản. Vui lòng thử lại trước khi đặt hàng." };
  if (!checkoutIdentityMatches(parsed.data.expectedUserId, session.user?.id ?? null)) {
    return { success: false, error: "Tài khoản đã thay đổi. Hãy cập nhật trang và kiểm tra tài khoản trước khi đặt hàng." };
  }
  const { data, error } = await supabase.rpc("veloce_place_order_with_receipt", {
    p_idempotency_key: parsed.data.idempotencyKey,
    p_receipt_token: parsed.data.receiptToken,
    p_customer_name: parsed.data.customerName,
    p_customer_phone: parsed.data.customerPhone,
    p_address: parsed.data.address,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
    })),
    p_customer_email: parsed.data.customerEmail || undefined,
    p_note: parsed.data.note || undefined,
    p_coupon_code: parsed.data.couponCode || undefined,
  });

  if (error) {
    // Lỗi từ RPC đã là tiếng Việt viết sẵn cho người dùng đọc — trả nguyên văn.
    return { success: false, error: error.message };
  }

  const row = data?.[0];
  if (!row) {
    return { success: false, error: "Không tạo được đơn hàng, vui lòng thử lại." };
  }

  // Tồn kho vừa đổi — làm mới cache sản phẩm (mục 4.9 PLAN.md). Dự án không bật
  updateTag("products");

  await saveReceipt({ id: row.order_id, code: row.order_code, token: parsed.data.receiptToken });

  return { success: true, orderCode: row.order_code, orderTotal: row.order_total };
}
