import { z } from "zod";

export const PRODUCT_BADGES = ["NEW", "SALE", "HOT", "LIMITED"] as const;
export const AVAILABLE_SIZES = [39, 40, 41, 42, 43, 44, 45] as const;

export const productColorSchema = z.object({
  name: z.string().min(1, "Nhập tên màu"),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Mã màu không hợp lệ"),
});

export const productFormSchema = z.object({
  name: z.string().min(2, "Nhập tên sản phẩm"),
  slug: z
    .string()
    .min(2, "Slug không hợp lệ")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  categoryId: z.string().uuid("Chọn danh mục"),
  price: z.number().int().min(1000, "Giá không hợp lệ"),
  originalPrice: z.number().int().min(1000, "Giá gốc không hợp lệ").nullable(),
  description: z.string().min(10, "Mô tả cần ít nhất 10 ký tự"),
  features: z.array(z.string().min(1)),
  sizes: z.array(z.number().int()).min(1, "Chọn ít nhất 1 size"),
  colors: z.array(productColorSchema).min(1, "Thêm ít nhất 1 màu"),
  badge: z.enum(PRODUCT_BADGES).nullable(),
  stock: z.number().int().min(0, "Tồn kho không hợp lệ"),
  isPublished: z.boolean(),
  images: z.array(z.string()).max(3, "Tối đa 3 ảnh"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
