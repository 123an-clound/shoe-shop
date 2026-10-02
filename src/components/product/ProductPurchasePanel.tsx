"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/product/ColorPicker";
import { SizePicker } from "@/components/product/SizePicker";
import { SizeGuide } from "@/components/product/SizeGuide";
import { AddToCartBar } from "@/components/product/AddToCartBar";
import type { Product } from "@/lib/queries/products";
import type { ProductColor } from "@/types";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

/** Gom state chọn màu/size để AddToCartBar dùng — chọn màu trước, size sau (Phụ lục A2 PLAN.md). */
export function ProductPurchasePanel({ product }: { product: Product }) {
  const { messages } = useLocaleContext();
  const colors = product.colors as ProductColor[];
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0]?.hex ?? null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-6">
      {colors.length > 0 && (
        <ColorPicker colors={colors} selected={selectedColor} onSelect={setSelectedColor} />
      )}

      <div>
        <p className="text-sm text-fg-muted">{messages.product.size}</p>
        <div className="mt-3">
          <SizePicker
            sizes={product.sizes}
            selected={selectedSize}
            onSelect={setSelectedSize}
            disabled={outOfStock}
          />
        </div>
      </div>

      <SizeGuide />

      <AddToCartBar
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
      />
    </div>
  );
}
