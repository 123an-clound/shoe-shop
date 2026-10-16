import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().max(200, "Tối đa 200 ký tự").min(2, "Nhập tên danh mục"),
  name_en: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  slug: z
    .string()
    .min(2, "Slug không hợp lệ")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  description_en: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
