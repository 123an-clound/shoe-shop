"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/product/ColorPicker";
import { SizePicker } from "@/components/product/SizePicker";
import { SizeGuide } from "@/components/product/SizeGuide";
import { AddToCartBar } from "@/components/product/AddToCartBar";
import type { Product } from "@/lib/queries/products";
import { getProductColors, getVariantStock, hasVariantInventory } from "@/lib/productVariants";
import { useProductSelection } from "@/components/product/ProductSelectionProvider";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";
import type { SizeGuideRow } from "@/lib/sizeGuide";
import { getSizeLabel } from "@/lib/sizeLabels";

/** Gom state chọn màu/size để AddToCartBar dùng — chọn màu trước, size sau (Phụ lục A2 PLAN.md). */
export function ProductPurchasePanel({ product, sizeGuide }: { product: Product; sizeGuide: SizeGuideRow[] }) {
  const { locale, messages } = useLocaleContext();
  const colors = getProductColors(product.colors);
  const { selectedColor, selectColor } = useProductSelection();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const outOfStock = product.stock <= 0;
  const selectedStock = getVariantStock(product, selectedColor, selectedSize);

  function handleSelectColor(hex: string) {
    selectColor(hex);
    if (selectedSize !== null && getVariantStock(product, hex, selectedSize) <= 0) setSelectedSize(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {colors.length > 0 && (
        <ColorPicker colors={colors} selected={selectedColor} onSelect={handleSelectColor} />
      )}

      <div>
        <p className="text-sm text-fg-muted">{messages.product.size}</p>
        <div className="mt-3">
          <SizePicker
            sizes={product.sizes}
            labels={Object.fromEntries(product.sizes.map((size) => [size, getSizeLabel(sizeGuide, size)]))}
            selected={selectedSize}
            onSelect={setSelectedSize}
            disabled={outOfStock}
            unavailableSizes={product.sizes.filter((size) => getVariantStock(product, selectedColor, size) <= 0)}
          />
        </div>
      </div>

      <SizeGuide rows={sizeGuide} />

      {selectedSize !== null && <p role="status" className="text-sm text-fg-muted">{hasVariantInventory(colors)
        ? locale === "en" ? `${selectedStock} pairs available in this color and size` : `Còn ${selectedStock} đôi cho màu và size đã chọn`
        : locale === "en" ? `${product.stock} pairs available` : `Tổng tồn kho còn ${product.stock} đôi`}</p>}

      <AddToCartBar
        key={`${selectedColor}-${selectedSize}`}
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
      />
    </div>
  );
}
