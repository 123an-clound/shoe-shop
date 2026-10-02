import { formatVND } from "@/lib/format";
import type { CartItem } from "@/store/cart";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

export function CheckoutSummary({
  items,
  subtotal,
  error,
}: {
  items: CartItem[];
  subtotal: number;
  error: string | null;
}) {
  const { locale, messages } = useLocaleContext();
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
        <p className="text-sm font-medium text-fg">{messages.checkout.product}</p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-muted">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex justify-between gap-4"
            >
              <span>
                {(locale === "en" ? item.nameEn || item.name : item.name)} · {item.color} · {messages.product.size} {item.size} × {item.quantity}
              </span>
              <span className="shrink-0 tabular-nums text-fg">
                {formatVND(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-ink-700 pt-3 text-sm">
          <span className="text-fg-muted">{messages.cart.estimated}</span>
          <span className="tabular-nums font-medium text-fg">{formatVND(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-fg-subtle">
          {messages.cart.totalNote}
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
