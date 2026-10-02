"use client";

import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { flyToCart } from "@/lib/flyToCart";
import { formatVND } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import type { Product } from "@/lib/queries/products";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

/** Chọn màu + size xong mới thêm được vào giỏ. Dính đáy màn hình trên mobile (Phụ lục A2 PLAN.md). */
export function AddToCartBar({
  product,
  selectedColor,
  selectedSize,
}: {
  product: Product;
  selectedColor: string | null;
  selectedSize: number | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const reducedMotion = usePrefersReducedMotion();
  const { locale, messages } = useLocaleContext();
  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (!selectedColor) {
      toast.error(messages.product.selectColor);
      return;
    }
    if (!selectedSize) {
      toast.error(messages.product.selectSize);
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      nameEn: product.name_en ?? product.name,
      price: product.price,
      image: product.images[0] ?? "",
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    if (!reducedMotion && buttonWrapperRef.current && product.images[0]) {
      flyToCart(buttonWrapperRef.current, product.images[0]);
    }

    toast.success(locale === "en" ? `${product.name_en || product.name} ${messages.product.added.toLowerCase()}` : `Đã thêm ${product.name} vào giỏ`);
    setQuantity(1);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-950/95 p-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <div className="mx-auto flex max-w-7xl items-center gap-4 lg:mx-0 lg:max-w-none">
        <div className="flex items-center rounded-lg border border-ink-700">
          <button
            type="button"
            aria-label="Giảm số lượng"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-fg-muted hover:text-fg"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm tabular-nums text-fg">{quantity}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-fg-muted hover:text-fg"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div ref={buttonWrapperRef} className="flex-1">
          <Button
            type="button"
            size="lg"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="w-full"
          >
            {outOfStock
              ? messages.product.soldOut
              : `${messages.product.addToCart} — ${formatVND(product.price * quantity)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
