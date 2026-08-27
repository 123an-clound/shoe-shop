import type { Metadata } from "next";
import { getAdminTestimonials } from "@/lib/queries/admin";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";

export const metadata: Metadata = { title: "Đánh giá — Quản trị" };

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Đánh giá khách hàng</h1>
      <TestimonialsManager testimonials={testimonials} />
    </div>
  );
}
