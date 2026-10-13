import { getCustomerHistory } from "@/lib/customer/history";
import { getCustomerProviders } from "@/lib/customer/providers";
import { customerCopy } from "@/lib/customer/copy";
import { CustomerLogin } from "./CustomerLogin";
import { CustomerOrderCard } from "./CustomerOrderCard";
import { CustomerAccountControls } from "./CustomerAccountControls";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/messages";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import type { CustomerOrderScope } from "@/lib/customer/orders";

export async function CustomerAccountOrders({ locale, page, scope = "all", authNotice }: { locale: Locale; page: number; scope?: CustomerOrderScope; authNotice?: string }) {
  const history = await getCustomerHistory(page, scope);
  return <CustomerAccountOrdersView locale={locale} history={history} scope={scope} authNotice={authNotice} />;
}

export async function CustomerAccountOrdersView({ locale, history, scope = "all", authNotice }: { locale: Locale; history: Awaited<ReturnType<typeof getCustomerHistory>>; scope?: CustomerOrderScope; authNotice?: string }) {
  const copy = customerCopy(locale);
  const signedIn = history.identity !== null;
  const orders = signedIn ? history.orders : history.recent;
  const groupLinks = [
    { scope: "all", label: copy.allOrders, count: history.active_count + history.history_count },
    { scope: "active", label: copy.activeOrders, count: history.active_count },
    { scope: "history", label: copy.orderHistory, count: history.history_count },
  ];
  const empty = scope === "active" ? copy.activeEmpty : scope === "history" ? copy.historyEmpty : signedIn ? copy.empty : copy.guestEmpty;
  return <section id="don-hang" className="mx-auto mb-16 max-w-4xl scroll-mt-24 px-4" aria-labelledby="customer-orders-title">
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5 sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="customer-orders-title" className="font-display text-2xl font-semibold text-fg">{copy.title}</h2>
          {signedIn && <p className="mt-2 break-all text-sm text-fg-muted">{copy.signedIn}: {history.identity}</p>}
        </div>
        {(signedIn || history.hasRecent || history.sessionError) && <CustomerAccountControls locale={locale} signedIn={signedIn} canClaim={signedIn && history.hasReceipts} />}
      </div>
      {authNotice === "error" && <p role="alert" className="mb-4 rounded-lg border border-red-500/50 bg-ink-900 p-3 text-sm text-fg">{copy.callbackError}</p>}
      {authNotice === "claim-failed" && <p role="alert" className="mb-4 rounded-lg border border-red-500/50 bg-ink-900 p-3 text-sm text-fg">{copy.claimError}</p>}
      {!signedIn && !history.sessionError && <CustomerLogin locale={locale} providers={await getCustomerProviders()} />}
      {history.error ? <p role="alert" className="mt-6 rounded-lg border border-red-500/50 bg-ink-900 p-3 text-sm text-fg">{history.sessionError ? copy.sessionError : copy.historyError}</p> : <>
        {!signedIn && history.hasRecent && <div className="mb-4 mt-8"><h3 className="font-semibold text-fg">{copy.guestTitle}</h3><p className="mt-2 text-sm leading-relaxed text-fg-muted">{copy.guestBody}</p></div>}
        {(signedIn || history.hasRecent) && <nav aria-label={copy.link} className="mt-6 flex flex-wrap gap-2">
          {groupLinks.map((group) => <LocaleLink key={group.scope} href={`/gio-hang?don-group=${group.scope}#don-hang`} aria-current={scope === group.scope ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${scope === group.scope ? "border-brand bg-brand text-on-brand" : "border-ink-700 text-fg-muted hover:text-fg"}`}>
            {group.label}<span className="tabular-nums">{group.count}</span>
          </LocaleLink>)}
        </nav>}
        <div className="mt-6 space-y-4">{orders.map((order) => <CustomerOrderCard key={order.id} order={order} locale={locale} />)}</div>
        {orders.length === 0 && <p className="mt-6 text-sm leading-relaxed text-fg-muted">{empty}</p>}
        {!signedIn && history.receiptError && <p role="alert" className="mt-4 text-sm text-fg-muted">{copy.receiptMissing}</p>}
        {signedIn && history.total > 20 && <nav aria-label={copy.link} className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {history.page > 1 ? <Button variant="glass" href={`/gio-hang?don-group=${scope}&don-page=${history.page - 1}#don-hang`}>{copy.previous}</Button> : <span />}
          <span className="text-sm text-fg-muted">{copy.page} {history.page} / {Math.ceil(history.total / 20)}</span>
          {history.page * 20 < history.total && <Button variant="glass" href={`/gio-hang?don-group=${scope}&don-page=${history.page + 1}#don-hang`}>{copy.next}</Button>}
        </nav>}
      </>}
    </div>
  </section>;
}
