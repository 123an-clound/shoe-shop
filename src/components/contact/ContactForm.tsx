"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

type ContactValues = { name: string; email: string; message: string };

export function ContactForm() {
  const { locale, messages } = useLocaleContext();
  const copy = messages.contact;
  const schema = z.object({
    name: z.string().min(2, locale === "en" ? "Enter your name" : "Nhập họ tên"),
    email: z.string().email(locale === "en" ? "Enter a valid email" : "Email không hợp lệ"),
    message: z.string().min(10, locale === "en" ? "Please write at least 10 characters" : "Nội dung cần ít nhất 10 ký tự"),
  });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: ContactValues) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success(locale === "en" ? `Thanks ${values.name}, we'll be in touch soon.` : `Cảm ơn ${values.name}, chúng tôi sẽ phản hồi sớm nhất.`);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input label={copy.name} error={errors.name?.message} {...register("name")} />
      <Input label={copy.email} type="email" error={errors.email?.message} {...register("email")} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm text-fg-muted">{copy.message}</label>
        <textarea id="message" rows={5} className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg placeholder:text-fg-subtle transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30" aria-invalid={!!errors.message} {...register("message")} />
        {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="self-start">{isSubmitting ? copy.sending : copy.send}</Button>
    </form>
  );
}
