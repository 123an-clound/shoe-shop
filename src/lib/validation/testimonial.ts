import { z } from "zod";

export const testimonialFormSchema = z.object({
  name: z.string().max(200, "Tối đa 200 ký tự").min(2, "Nhập tên khách hàng"),
  role: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  roleEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  content: z.string().min(10, "Nội dung cần ít nhất 10 ký tự"),
  contentEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  rating: z.number().int().min(1).max(5),
  isPublished: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;
