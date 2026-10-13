import { z } from "zod";
import { sizeGuideSchema } from "@/lib/sizeGuide";

export const PRODUCT_BADGES = ["NEW", "SALE", "HOT", "LIMITED"] as const;
export const AVAILABLE_SIZES = [39, 40, 41, 42, 43, 44, 45] as const;
export const MAX_PRODUCT_IMAGES = 10;

export const productColorSchema = z.object({
  name: z.string().min(1, "Nhập tên màu"),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Mã màu không hợp lệ"),
  image: z.string().url("Ảnh đại diện không hợp lệ").nullable().optional(),
  inventory: z.array(z.object({
    size: z.number().int().min(1).max(60),
    quantity: z.number().int().min(0, "Số lượng phải là số nguyên từ 0 trở lên").max(2147483647),
  })).max(60).optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "Nhập tên sản phẩm"),
  nameEn: z.string().optional(),
  slug: z
    .string()
    .min(2, "Slug không hợp lệ")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  categoryId: z.string().uuid("Chọn danh mục"),
  price: z.number().int().min(1000, "Giá không hợp lệ"),
  originalPrice: z.number().int().min(1000, "Giá gốc không hợp lệ").nullable(),
  description: z.string().min(10, "Mô tả cần ít nhất 10 ký tự"),
  descriptionEn: z.string().optional(),
  features: z.array(z.string().min(1)),
  featuresEn: z.array(z.string()),
  sizes: z.array(z.number().int().min(1).max(60)).min(1, "Chọn ít nhất 1 size").max(60),
  sizeGuide: sizeGuideSchema,
  colors: z.array(productColorSchema).min(1, "Thêm ít nhất 1 màu").max(30),
  badge: z.enum(PRODUCT_BADGES).nullable(),
  stock: z.number().int().min(0, "Tồn kho không hợp lệ"),
  isPublished: z.boolean(),
  images: z.array(z.string()).max(MAX_PRODUCT_IMAGES, `Tối đa ${MAX_PRODUCT_IMAGES} ảnh`),
  videoUrl: z.string().url("Video không hợp lệ").nullable(),
}).superRefine((data, ctx) => {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
  if (new Set(data.sizes).size !== data.sizes.length) issue(["sizes"], "Size không được trùng nhau");
  const hexes = new Set<string>();
  const tracked = data.colors.some((color) => color.inventory !== undefined);
  let total = 0;
  data.colors.forEach((color, index) => {
    const hex = color.hex.toLowerCase();
    if (hexes.has(hex)) issue(["colors", index, "hex"], "Mã màu không được trùng nhau");
    hexes.add(hex);
    if (color.image && !data.images.includes(color.image)) issue(["colors", index, "image"], "Chọn ảnh có trong bộ ảnh sản phẩm");
    if (!tracked) return;
    if (!color.inventory || color.inventory.length !== data.sizes.length ||
        new Set(color.inventory.map((entry) => entry.size)).size !== data.sizes.length ||
        color.inventory.some((entry) => !data.sizes.includes(entry.size))) {
      issue(["colors", index, "inventory"], "Nhập tồn kho cho từng size của màu này");
    }
    total += (color.inventory ?? []).reduce((sum, entry) => sum + entry.quantity, 0);
  });
  if (total > 2147483647) issue(["colors"], "Tổng tồn kho vượt giới hạn cho phép");
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
