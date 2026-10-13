"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { signOutCustomer, saveCustomerReceipts } from "@/lib/actions/customer-auth";
import { customerCopy } from "@/lib/customer/copy";
import { notifyCustomerAuthChanged } from "@/lib/customer/auth-events";
import type { Locale } from "@/lib/i18n/messages";

export function CustomerAccountControls({ locale, signedIn, canClaim }: { locale: Locale; signedIn: boolean; canClaim: boolean }) {
  const copy = customerCopy(locale), router = useRouter();
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  async function action(kind: "logout" | "claim") {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const result = await (kind === "logout" ? signOutCustomer(locale) : saveCustomerReceipts(locale));
      if (result.success) { notifyCustomerAuthChanged(); router.refresh(); }
      else setError(result.error);
    } catch { setError(copy.authError); } finally { setBusy(false); }
  }
  return <div>
    <div className="flex flex-wrap gap-2">
      <Button variant="glass" type="button" disabled={busy} onClick={() => router.refresh()}>{copy.refresh}</Button>
      {signedIn && canClaim && <Button variant="glass" type="button" disabled={busy} onClick={() => action("claim")}>{copy.claim}</Button>}
      {signedIn && <Button variant="ghost" className="text-fg" type="button" disabled={busy} onClick={() => action("logout")}>{copy.signOut}</Button>}
    </div>
    {error && <p className="mt-3 rounded-lg border border-red-500/50 bg-ink-900 p-3 text-sm text-fg" role="alert">{error}</p>}
  </div>;
}
