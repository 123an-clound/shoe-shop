"use client";

import { ShoppingBag } from "lucide-react";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { FreeshipProgress } from "@/components/cart/FreeshipProgress";
import { Button } from "@/components/ui/Button";
import { useCartHydrated, useCartStore } from "@/store/cart";
import { formatVND } from "@/lib/format";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";
import { translate } from "@/lib/i18n/messages";

export function CartPageContent({
  freeshipThreshold,
  couponCode,
  couponPercent,
}: {
  freeshipThreshold: number;
  couponCode: string | null;
  couponPercent: number;
}) {
  const { messages } = useLocaleContext();
  const copy = messages.cart;
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-fg-subtle" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-fg">{copy.emptyTitle}</h1>
        <p className="text-fg-muted">{copy.emptyBody}</p>
        <Button href="/san-pham">{copy.continue}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{copy.title}</h1>

      {couponCode && (
        <div className="mt-6 rounded-lg border border-brand/30 bg-brand/10 p-3 text-sm text-brand">
          {translate(copy.coupon, { code: couponCode, percent: couponPercent })}
        </div>
      )}

      <div className="mt-6">
        <FreeshipProgress subtotal={subtotal} threshold={freeshipThreshold} />
      </div>

      <ul className="mt-6 flex flex-col gap-6">
        {items.map((item) => (
          <CartItemRow key={`${item.productId}-${item.size}-${item.color}`} item={item} />
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4 border-t border-ink-700 pt-6">
        <div className="flex w-full max-w-xs items-center justify-between text-base">
          <span className="text-fg-muted">{copy.subtotal}</span>
          <span className="tabular-nums font-medium text-fg">{formatVND(subtotal)}</span>
        </div>
        <p className="text-right text-xs text-fg-subtle">
          {copy.shippingNote}
        </p>
        <Button href="/thanh-toan" size="lg" className="w-full max-w-xs">
          {copy.proceed}
        </Button>
      </div>
    </div>
  );
}
