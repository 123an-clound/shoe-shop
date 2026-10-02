"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cart";
import { formatVND } from "@/lib/format";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { locale, messages } = useLocaleContext();
  const displayName = locale === "en" ? item.nameEn || item.name : item.name;

  return (
    <li className="flex gap-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-800">
        {item.image && (
          <Image src={item.image} alt={displayName} fill sizes="80px" className="object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-fg">{displayName}</p>
          <button
            type="button"
            aria-label={`${messages.cart.remove} ${displayName}`}
            onClick={() => removeItem(item.productId, item.size, item.color)}
            className="text-fg-subtle transition-colors hover:text-fg"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-fg-subtle">
          {item.color} · {messages.product.size} {item.size}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-ink-700">
            <button
              type="button"
              aria-label={messages.cart.quantity}
              onClick={() =>
                updateQuantity(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))
              }
              className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-xs tabular-nums text-fg">{item.quantity}</span>
            <button
              type="button"
              aria-label={messages.cart.quantity}
              onClick={() =>
                updateQuantity(item.productId, item.size, item.color, Math.min(10, item.quantity + 1))
              }
              className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <span className="text-sm tabular-nums text-fg">
            {formatVND(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}
