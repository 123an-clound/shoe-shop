"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { placeOrderInputSchema } from "@/lib/validation/order";

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
  const { data, error } = await supabase.rpc("veloce_place_order", {
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
  // Cache Components nên dùng revalidateTag kiểu cũ (2 tham số bắt buộc ở Next 16).
  revalidateTag("products", "max");

  return { success: true, orderCode: row.order_code, orderTotal: row.order_total };
}
