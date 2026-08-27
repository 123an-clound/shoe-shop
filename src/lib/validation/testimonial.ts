import { z } from "zod";

export const testimonialFormSchema = z.object({
  name: z.string().min(2, "Nhập tên khách hàng"),
  role: z.string().optional(),
  content: z.string().min(10, "Nội dung cần ít nhất 10 ký tự"),
  rating: z.number().int().min(1).max(5),
  isPublished: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;
