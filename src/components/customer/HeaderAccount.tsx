"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRound, LogOut } from "lucide-react";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { customerCopy } from "@/lib/customer/copy";
import { CUSTOMER_AUTH_CHANGED, notifyCustomerAuthChanged } from "@/lib/customer/auth-events";
import { signOutCustomer } from "@/lib/actions/customer-auth";
import type { Locale } from "@/lib/i18n/messages";

export function HeaderAccount({ locale }: { locale: Locale }) {
  const copy = customerCopy(locale), router = useRouter(), pathname = usePathname();
  const [session, setSession] = useState<{ signedIn: boolean; identity: string | null } | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    let controller: AbortController | undefined;
    let lastRefresh = 0;
    async function refresh(force = false) {
      if (!force && Date.now() - lastRefresh < 1000) return;
      lastRefresh = Date.now();
      controller?.abort();
      const pending = new AbortController(); controller = pending;
      try {
        const response = await fetch("/api/customer/session", { cache: "no-store", signal: pending.signal });
        if (!response.ok) throw new Error("Session unavailable");
        const value = await response.json();
        if (typeof value.signedIn !== "boolean" || (value.signedIn && typeof value.identity !== "string")) throw new Error("Invalid session");
        if (!pending.signal.aborted) { setSession(value); setError(null); }
      } catch { if (!pending.signal.aborted) { setSession(null); setError(copy.unavailable); } }
    }
    void refresh();
    const onResume = () => { void refresh(); };
    const onAuthChange = () => { void refresh(true); };
    window.addEventListener("focus", onResume);
    window.addEventListener("pageshow", onResume);
    window.addEventListener(CUSTOMER_AUTH_CHANGED, onAuthChange);
    return () => { controller?.abort(); window.removeEventListener("focus", onResume); window.removeEventListener("pageshow", onResume); window.removeEventListener(CUSTOMER_AUTH_CHANGED, onAuthChange); };
  }, [pathname, copy.unavailable]);
  const controlClass = "flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-fg hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand xl:w-32";
  if (!session?.signedIn) return <LocaleLink href="/gio-hang#don-hang" className={controlClass} aria-label={session ? copy.signIn : copy.account} title={error || undefined}>
    <UserRound className="h-5 w-5" aria-hidden="true" /><span className="hidden text-sm xl:inline">{session ? copy.signIn : copy.account}</span>
  </LocaleLink>;
  async function logout() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const result = await signOutCustomer(locale);
      if (!result.success) { setError(result.error); return; }
      setSession({ signedIn: false, identity: null });
      if (disclosure.current) disclosure.current.open = false;
      notifyCustomerAuthChanged(); router.refresh();
    } catch { setError(copy.authError); } finally { setBusy(false); }
  }
  return <details ref={disclosure} className="relative" onKeyDown={(event) => {
    if (event.key === "Escape" && disclosure.current?.open) { disclosure.current.open = false; disclosure.current.querySelector("summary")?.focus(); }
  }}>
    <summary className={`${controlClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label={copy.account}>
      <UserRound className="h-5 w-5" aria-hidden="true" /><span className="hidden text-sm xl:inline">{copy.account}</span>
    </summary>
    <div className="absolute right-0 top-14 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-ink-700 bg-ink-950 p-4 shadow-xl">
      <p className="text-xs text-fg-muted">{copy.signedIn}</p><p className="mt-1 break-all text-sm font-medium text-fg">{session.identity}</p>
      <LocaleLink href="/gio-hang#don-hang" className="mt-3 flex min-h-11 items-center rounded-lg px-3 text-sm text-fg hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-brand" onClick={() => { if (disclosure.current) disclosure.current.open = false; }}>{copy.link}</LocaleLink>
      <button type="button" disabled={busy} onClick={logout} className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm text-fg hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"><LogOut className="h-4 w-4" aria-hidden="true" />{busy ? "…" : copy.signOut}</button>
      {error && <p role="alert" className="mt-2 text-sm text-fg">{error}</p>}
    </div>
  </details>;
}
