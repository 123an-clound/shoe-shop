"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";
import { subscribeToNewsletter } from "@/lib/actions/publicForms";

type NewsletterValues = { email: string };

export function Newsletter({ locale = "vi" }: { locale?: Locale }) {
  const copy = getMessages(locale).home;
  const schema = z.object({ email: z.string().email(locale === "en" ? "Enter a valid email" : "Email không hợp lệ") });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: NewsletterValues) {
    const result = await subscribeToNewsletter({ ...values, locale });
    if (!result.success) {
      toast.error(copy.submitError);
      return;
    }
    toast.success(copy.subscribed);
    reset();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="glass glow-border rounded-[var(--radius-card)] p-8 sm:p-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">{copy.newsletter}</h2>
            <p className="mt-2 text-fg-muted">{copy.newsletterBody}</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
              <div className="w-full flex-1"><Input type="email" placeholder="you@example.com" aria-label={copy.email} error={errors.email?.message} {...register("email")} /></div>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (locale === "en" ? "Signing up..." : "Đang đăng ký...") : copy.subscribe}</Button>
            </form>
            <p className="mt-3 text-xs text-fg-subtle">{copy.newsletterPrivacy}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
