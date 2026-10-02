"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTestimonial, updateTestimonial } from "@/lib/actions/testimonials";
import {
  testimonialFormSchema,
  type TestimonialFormValues,
} from "@/lib/validation/testimonial";
import type { AdminTestimonial } from "@/lib/queries/admin";

export function TestimonialForm({
  testimonial,
  onDone,
}: {
  testimonial?: AdminTestimonial;
  onDone: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          role: testimonial.role ?? "",
          roleEn: testimonial.role_en ?? "",
          content: testimonial.content,
          contentEn: testimonial.content_en ?? "",
          rating: testimonial.rating,
          isPublished: testimonial.is_published,
        }
      : { name: "", role: "", roleEn: "", content: "", contentEn: "", rating: 5, isPublished: true },
  });

  async function onSubmit(values: TestimonialFormValues) {
    let result;
    try {
      result = testimonial
        ? await updateTestimonial(testimonial.id, testimonial.updated_at, values)
        : await createTestimonial(values);
    } catch {
      toast.error("Không kết nối được. Nội dung chưa được lưu.");
      return;
    }

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã lưu đánh giá");
    router.refresh();
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-3 rounded-lg border border-ink-700 bg-ink-900 p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Tên khách hàng" error={errors.name?.message} {...register("name")} />
        <Input label="Vai trò (không bắt buộc)" {...register("role")} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input label="Role (English)" {...register("roleEn")} /></div>
      <div>
        <label className="text-sm text-fg-muted">Nội dung</label>
        <textarea
          rows={3}
          {...register("content")}
          className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg focus:border-brand focus:outline-none"
        />
        {errors.content && <p className="mt-1 text-xs text-red-400">{errors.content.message}</p>}
      </div>
      <div>
        <label className="text-sm text-fg-muted">Review (English)</label>
        <textarea rows={3} {...register("contentEn")} className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg focus:border-brand focus:outline-none" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Số sao (1-5)"
          type="number"
          min={1}
          max={5}
          error={errors.rating?.message}
          {...register("rating", { valueAsNumber: true })}
        />
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-fg-muted">
          <input type="checkbox" {...register("isPublished")} className="accent-brand" />
          Hiển thị trên trang chủ
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Hủy
        </Button>
      </div>
    </form>
  );
}
