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
import { getColorImage, getProductColors, getVariantStock } from "@/lib/productVariants";

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
  const stock = getVariantStock(product, selectedColor, selectedSize);
  const outOfStock = product.stock <= 0 ||
    (selectedColor !== null && product.sizes.every((size) => getVariantStock(product, selectedColor, size) <= 0)) ||
    (selectedSize !== null && stock <= 0);
  const image = getColorImage(product.images, getProductColors(product.colors), selectedColor);
  const items = useCartStore((state) => state.items);
  const inCart = items.find((item) => item.productId === product.id && item.color === selectedColor && item.size === selectedSize)?.quantity ?? 0;
  const maxQuantity = Math.max(0, Math.min(10 - inCart, stock - inCart));
  const chosenQuantity = Math.min(quantity, Math.max(1, maxQuantity));

  function handleAddToCart() {
    if (!selectedColor) {
      toast.error(messages.product.selectColor);
      return;
    }
    if (!selectedSize) {
      toast.error(messages.product.selectSize);
      return;
    }
    if (maxQuantity <= 0) {
      toast.error(locale === "en" ? "Your cart already contains all available pairs of this variant." : "Giỏ hàng đã có đủ số đôi còn lại của màu và size này.");
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      nameEn: product.name_en ?? product.name,
      price: product.price,
      image,
      size: selectedSize,
      color: selectedColor,
      quantity: chosenQuantity,
    });

    if (!reducedMotion && buttonWrapperRef.current && image) {
      flyToCart(buttonWrapperRef.current, image);
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
            disabled={chosenQuantity <= 1}
            onClick={() => setQuantity(Math.max(1, chosenQuantity - 1))}
            className="flex h-11 w-11 items-center justify-center text-fg-muted hover:text-fg"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm tabular-nums text-fg">{chosenQuantity}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={selectedSize === null || chosenQuantity >= maxQuantity}
            onClick={() => setQuantity(Math.min(maxQuantity, chosenQuantity + 1))}
            className="flex h-11 w-11 items-center justify-center text-fg-muted hover:text-fg"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div ref={buttonWrapperRef} className="flex-1">
          <Button
            type="button"
            size="lg"
            disabled={outOfStock || (selectedSize !== null && maxQuantity <= 0)}
            onClick={handleAddToCart}
            className="w-full"
          >
            {outOfStock
              ? messages.product.soldOut
              : `${messages.product.addToCart} — ${formatVND(product.price * chosenQuantity)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
