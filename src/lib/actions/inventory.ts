"use server";

import { PublicError } from "@/lib/security/errors";

import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { getProductColors } from "@/lib/productVariants";
import { prepareProductInventory } from "@/lib/validation/inventory";
import type { ActionResult } from "@/lib/actions/products";

export async function updateProductInventory(productId: string, expectedUpdatedAt: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(productId).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) {
      throw new PublicError("Phiên bản sản phẩm không hợp lệ. Hãy tải lại trang.");
    }
    const { data: product, error: readError } = await supabase.from("veloce_products")
      .select("colors, sizes, updated_at").eq("id", productId).maybeSingle();
    if (readError) throw new PublicError("Không tải được tồn kho sản phẩm. Hãy thử lại.");
    if (!product) throw new PublicError("Sản phẩm không tồn tại hoặc đã bị xóa.");
    if (product.updated_at !== expectedUpdatedAt) {
      throw new PublicError("Sản phẩm hoặc tồn kho vừa thay đổi. Tải lại trang để xem số lượng mới trước khi lưu.");
    }
    const colors = prepareProductInventory(input, getProductColors(product.colors), product.sizes);
    const { data: ready, error: readyError } = await supabase.rpc("veloce_variant_inventory_ready");
    if (readyError || !ready) throw new PublicError("Chưa thể lưu tồn kho theo màu và size. Vui lòng hoàn tất cập nhật cơ sở dữ liệu.");

    // So sánh phiên bản ngay trong UPDATE để không ghi đè tồn kho vừa trừ bởi đơn hàng.
    const { data: updated, error } = await supabase.from("veloce_products")
      .update({ colors }).eq("id", productId).eq("updated_at", expectedUpdatedAt).select("id").maybeSingle();
    if (error) throw new PublicError("Không lưu được tồn kho. Số lượng bạn nhập vẫn được giữ lại; hãy thử lại.");
    if (!updated) throw new PublicError("Tồn kho vừa thay đổi. Tải lại trang để kiểm tra trước khi lưu tiếp.");
    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}
