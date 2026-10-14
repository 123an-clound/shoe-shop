import { customerCopy } from "@/lib/customer/copy";
import type { CustomerOrder } from "@/lib/customer/orders";
import type { Locale } from "@/lib/i18n/messages";
import { formatVND } from "@/lib/format";

export function CustomerOrderCard({ order, locale, headingLevel = 3 }: { order: CustomerOrder; locale: Locale; headingLevel?: 2 | 3 }) {
  const copy = customerCopy(locale);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const steps = ["pending", "confirmed", "shipping", "done"] as const;
  const position = steps.findIndex((status) => status === order.status);
  return (
    <article className="rounded-xl border border-ink-700 bg-ink-900/50 p-4 sm:p-5" aria-label={order.code}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading className="font-semibold text-fg">{order.code}</Heading>
          <p className="mt-1 text-xs text-fg-muted">{copy.placed}: <time dateTime={order.created_at}>{new Date(order.created_at).toLocaleDateString(locale === "en" ? "en-GB" : "vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</time></p>
        </div>
        <span className="rounded-full border border-ink-700 px-3 py-1 text-sm font-medium text-fg">{copy.status[order.status]}</span>
      </div>
      {order.status !== "cancelled" && <ol className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4" aria-label={copy.status[order.status]}>
        {steps.map((status, index) => <li key={status} aria-current={index === position ? "step" : undefined} className={index <= position ? "border-t-2 border-brand pt-2 font-medium text-fg" : "border-t-2 border-ink-700 pt-2 text-fg-muted"}>{copy.status[status]}</li>)}
      </ol>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-fg-muted">{order.payment_status ? copy.payment[order.payment_status] : "—"}</p>
        <p className="font-semibold tabular-nums text-fg">{formatVND(order.total)}</p>
      </div>
      {(order.shipping_carrier || order.tracking_number) && <dl className="mt-4 grid gap-2 rounded-lg border border-ink-700 p-3 text-sm">
        {order.shipping_carrier && <div><dt className="text-fg-muted">{copy.carrier}</dt><dd className="text-fg">{order.shipping_carrier}</dd></div>}
        {order.tracking_number && <div><dt className="text-fg-muted">{copy.tracking}</dt><dd className="break-all font-medium text-fg">{order.tracking_number}</dd></div>}
      </dl>}
      <details className="mt-4 border-t border-ink-700 pt-3">
        <summary className="cursor-pointer rounded text-sm text-fg underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand">{copy.details}</summary>
        <ul className="mt-3 space-y-3">
          {order.items.map((item, index) => <li key={index} className="flex flex-wrap justify-between gap-2 text-sm">
            <div><p className="text-fg">{item.name}</p><p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">{copy.size} {item.size_label ?? item.size} · {copy.quantity} {item.quantity} · <span className="inline-block h-3 w-3 rounded-full border border-ink-700" style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(item.color) ? item.color : undefined }} aria-hidden="true" />{item.color}</p></div>
            <p className="tabular-nums text-fg">{formatVND(item.price * item.quantity)}</p>
          </li>)}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-ink-700 pt-3 text-sm">
          {[[copy.subtotal, order.subtotal], [copy.discount, -order.discount], [copy.shippingFee, order.shipping_fee], [copy.total, order.total]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-fg"><dt>{label}</dt><dd className="tabular-nums">{formatVND(Number(value))}</dd></div>)}
        </dl>
      </details>
    </article>
  );
}
