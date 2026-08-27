"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const contactSchema = z.object({
  name: z.string().min(2, "Nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  message: z.string().min(10, "Nội dung cần ít nhất 10 ký tự"),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactValues) {
    // Demo: chưa có bảng lưu liên hệ, chỉ mô phỏng gửi thành công.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success(`Cảm ơn ${values.name}, chúng tôi sẽ phản hồi sớm nhất.`);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label="Họ và tên" error={errors.name?.message} {...register("name")} />
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm text-fg-muted">
          Nội dung
        </label>
        <textarea
          id="message"
          rows={5}
          className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
      </Button>
    </form>
  );
}
