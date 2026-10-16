import { z } from "zod";
import type { ProductColor } from "@/types";
import { PublicError } from "@/lib/security/errors";

export const productInventorySchema = z.object({
  colors: z.array(z.object({
    hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Mã màu không hợp lệ"),
    inventory: z.array(z.object({
      size: z.number().int().min(1).max(60),
      quantity: z.number({ error: "Nhập số lượng tồn kho" }).int("Số lượng phải là số nguyên")
        .min(0, "Số lượng không được âm").max(2147483647, "Số lượng vượt giới hạn cho phép"),
    }).strict()).min(1, "Chọn size trước khi nhập tồn kho").max(60),
  }).strict()).min(1, "Thêm màu trước khi nhập tồn kho").max(30),
}).strict().superRefine((data, ctx) => {
  const hexes = new Set<string>();
  let total = 0;
  data.colors.forEach((color, index) => {
    const hex = color.hex.toLowerCase();
    if (hexes.has(hex)) ctx.addIssue({ code: "custom", path: ["colors", index, "hex"], message: "Mã màu không được trùng nhau" });
    hexes.add(hex);
    const sizes = new Set<number>();
    color.inventory.forEach((entry, inventoryIndex) => {
      if (sizes.has(entry.size)) ctx.addIssue({ code: "custom", path: ["colors", index, "inventory", inventoryIndex, "size"], message: "Size không được trùng nhau" });
      sizes.add(entry.size);
      total += entry.quantity;
    });
  });
  if (total > 2147483647) ctx.addIssue({ code: "custom", path: ["colors"], message: "Tổng tồn kho vượt giới hạn cho phép" });
});

export function toInventoryInput(colors: ProductColor[]) {
  return { colors: colors.map((color) => ({ hex: color.hex, inventory: color.inventory })) };
}

/** Chỉ thay số lượng; tên màu, ảnh và danh sách biến thể luôn lấy từ server. */
export function prepareProductInventory(input: unknown, colors: ProductColor[], sizes: number[]): ProductColor[] {
  const parsed = productInventorySchema.safeParse(input);
  if (!parsed.success) throw new PublicError(parsed.error.issues[0]?.message ?? "Tồn kho không hợp lệ.");
  if (!sizes.length || parsed.data.colors.length !== colors.length ||
      new Set(colors.map((color) => color.hex.toLowerCase())).size !== colors.length) {
    throw new PublicError("Màu hoặc size đã thay đổi. Tải lại trang trước khi lưu tồn kho.");
  }
  return colors.map((color) => {
    const submitted = parsed.data.colors.find((entry) => entry.hex.toLowerCase() === color.hex.toLowerCase());
    if (!submitted || submitted.inventory.length !== sizes.length || submitted.inventory.some((entry) => !sizes.includes(entry.size))) {
      throw new PublicError("Nhập tồn kho cho đầy đủ size và màu hiện có của sản phẩm.");
    }
    return { ...color, inventory: sizes.map((size) => ({ size, quantity: submitted.inventory.find((entry) => entry.size === size)!.quantity })) };
  });
}
