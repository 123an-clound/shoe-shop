import { getCustomerSession } from "@/lib/customer/session";
import { getCustomerProviders } from "@/lib/customer/providers";
import { customerCopy } from "@/lib/customer/copy";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { CustomerLogin } from "./CustomerLogin";
import { CustomerAccountControls } from "./CustomerAccountControls";
import type { Locale } from "@/lib/i18n/messages";

export async function CheckoutAccount({ locale, authNotice }: { locale: Locale; authNotice?: string }) {
  const copy = customerCopy(locale), session = await getCustomerSession();
  return <section id="tai-khoan" aria-labelledby="checkout-account-title" className="mx-auto mb-8 max-w-xl scroll-mt-24 rounded-2xl border border-ink-700 bg-ink-900 p-5">
    <h2 id="checkout-account-title" className="font-semibold text-fg">{copy.checkoutAccount}</h2>
    {authNotice === "error" && <p role="alert" className="mt-3 text-sm text-fg">{copy.callbackError}</p>}
    {authNotice === "claim-failed" && <p role="alert" className="mt-3 text-sm text-fg">{copy.claimError}</p>}
    {session.error ? <div className="mt-3"><p role="alert" className="mb-3 text-sm text-fg">{copy.sessionError}</p><CustomerAccountControls locale={locale} signedIn={false} canClaim={false} /></div> : session.user ? <>
      <p className="my-3 break-words text-sm leading-relaxed text-fg-muted">{copy.checkoutSaved}: <strong className="break-all text-fg">{session.user.phone || session.user.email || "—"}</strong></p>
      <LocaleLink href="/gio-hang#don-hang" className="mb-3 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">{copy.link}</LocaleLink>
      <CustomerAccountControls locale={locale} signedIn canClaim={false} />
    </> : <>
      <p className="my-3 text-sm leading-relaxed text-fg-muted">{copy.checkoutGuest}</p>
      <details><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-brand focus-visible:outline-2 focus-visible:outline-brand">{copy.signIn}</summary><div className="mt-4"><CustomerLogin locale={locale} target="checkout" providers={await getCustomerProviders()} /></div></details>
    </>}
  </section>;
}
