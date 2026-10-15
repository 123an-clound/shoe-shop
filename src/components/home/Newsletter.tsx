"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";
import { subscribeToNewsletter } from "@/lib/actions/publicForms";

export function Newsletter({ locale = "vi" }: { locale?: Locale }) {
  const copy = getMessages(locale).home;
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    setSubmitting(true); setError(undefined);
    try {
      const email = String(new FormData(form).get("email") || "").trim();
      const result = await subscribeToNewsletter({ email, locale });
      if (!result.success) { setError(copy.submitError); toast.error(copy.submitError); return; }
      toast.success(copy.subscribed); form.reset();
    } catch { setError(copy.submitError); toast.error(copy.submitError); }
    finally { setSubmitting(false); }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="glass glow-border rounded-[var(--radius-card)] p-8 sm:p-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">{copy.newsletter}</h2>
            <p className="mt-2 text-fg-muted">{copy.newsletterBody}</p>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
              <div className="w-full flex-1"><Input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" aria-label={copy.email} error={error}
                onInvalid={() => setError(locale === "en" ? "Enter a valid email" : "Email không hợp lệ")} onChange={() => setError(undefined)} /></div>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (locale === "en" ? "Signing up..." : "Đang đăng ký...") : copy.subscribe}</Button>
            </form>
            <p className="mt-3 text-xs text-fg-subtle">{copy.newsletterPrivacy}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
