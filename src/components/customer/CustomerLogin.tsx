"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { customerCopy } from "@/lib/customer/copy";
import { normalizeEmail, isOtpCode, customerReturnPath, customerReturnHash, type CustomerAuthTarget } from "@/lib/customer/identity";
import { notifyCustomerAuthChanged } from "@/lib/customer/auth-events";
import { sendCustomerOtp, verifyCustomerOtp, signInCustomerGoogle } from "@/lib/actions/customer-auth";
import type { Locale } from "@/lib/i18n/messages";

export function CustomerLogin({ locale, providers, target = "cart" }: { locale: Locale; providers: { email: boolean; google: boolean; available: boolean }; target?: CustomerAuthTarget }) {
  const copy = customerCopy(locale), router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function send() {
    if (busy || cooldown > 0) return;
    if (!normalizeEmail(email)) { setError(copy.invalidEmail); return; }
    setBusy(true); setError(null);
    try {
      const result = await sendCustomerOtp(email, locale);
      if (result.success) { setSent(true); setCooldown(60); setOtp(""); }
      else setError(result.error);
    } catch { setError(copy.authError); } finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sent) { await send(); return; }
    if (busy) return;
    if (!isOtpCode(otp)) { setError(copy.invalidOtp); return; }
    setBusy(true); setError(null);
    try {
      const result = await verifyCustomerOtp(email, otp, locale);
      if (result.success) {
        notifyCustomerAuthChanged();
        if (result.claimFailed) router.replace(`${customerReturnPath(locale, target)}?auth=claim-failed#${customerReturnHash(target)}`, { scroll: false });
        router.refresh();
      } else setError(result.error);
    } catch { setError(copy.authError); } finally { setBusy(false); }
  }
  async function google() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const result = await signInCustomerGoogle(locale, target);
      if (result.success && result.url) window.location.assign(result.url);
      else if (!result.success) setError(result.error);
    } catch { setError(copy.authError); } finally { setBusy(false); }
  }
  return (
    <div className="max-w-md">
      <p className="mb-5 text-sm leading-relaxed text-fg-muted">{copy.intro}</p>
      {(!providers.available || (!providers.email && !providers.google)) && <p className="mb-5 rounded-lg border border-ink-700 bg-ink-900 p-3 text-sm text-fg-muted">{providers.available ? copy.disabled : copy.unavailable}</p>}
      <Button type="button" variant="glass" className="w-full" disabled={busy || !providers.google} onClick={google}>{copy.google}</Button>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4" aria-busy={busy}>
        <Input id="customer-email" label={copy.email} type="email" inputMode="email" autoComplete="email" placeholder="ban@gmail.com" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy || sent || !providers.email} />
        {sent && <>
          <p className="text-sm text-fg-muted" role="status">{copy.sent}</p>
          <Input id="customer-otp" label={copy.otp} inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} disabled={busy} autoFocus />
        </>}
        <Button type="submit" className="w-full" disabled={busy || !providers.email || (!sent && cooldown > 0)}>{busy ? "…" : sent ? copy.verify : `${copy.send}${cooldown > 0 ? ` (${cooldown}s)` : ""}`}</Button>
        {sent && <div className="flex flex-wrap justify-between gap-2">
          <Button variant="ghost" type="button" disabled={busy || cooldown > 0} onClick={send}>{copy.resend}{cooldown > 0 ? ` (${cooldown}s)` : ""}</Button>
          <Button variant="ghost" type="button" disabled={busy} onClick={() => { setSent(false); setOtp(""); setError(null); }}>{copy.changeEmail}</Button>
        </div>}
        {error && <p role="alert" className="rounded-lg border border-red-500/50 bg-ink-900 p-3 text-sm text-fg">{error}</p>}
      </form>
    </div>
  );
}
