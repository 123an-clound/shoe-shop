import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(2, "Nhập tên danh mục"),
  slug: z
    .string()
    .min(2, "Slug không hợp lệ")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
