"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { getColorImage, getProductColors } from "@/lib/productVariants";

const ProductSelectionContext = createContext<{
  selectedColor: string | null;
  selectColor: (hex: string) => void;
  activeMedia: number;
  selectMedia: (index: number) => void;
} | null>(null);

export function ProductSelectionProvider({ colors: value, images, children }: { colors: unknown; images: string[]; children: ReactNode }) {
  const colors = getProductColors(value);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0]?.hex ?? null);
  const [activeMedia, setActiveMedia] = useState(() => Math.max(0, images.indexOf(getColorImage(images, colors, colors[0]?.hex ?? null))));

  function selectColor(hex: string) {
    setSelectedColor(hex);
    setActiveMedia(Math.max(0, images.indexOf(getColorImage(images, colors, hex))));
  }

  return <ProductSelectionContext value={{ selectedColor, selectColor, activeMedia, selectMedia: setActiveMedia }}>{children}</ProductSelectionContext>;
}

export function useProductSelection() {
  const selection = useContext(ProductSelectionContext);
  if (!selection) throw new Error("Product selection provider is missing");
  return selection;
}
