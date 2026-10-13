import type { ProductColor } from "@/types";

export function getProductColors(value: unknown): ProductColor[] {
  if (!Array.isArray(value)) return [];
  return value.filter((color): color is ProductColor =>
    !!color && typeof color.name === "string" && typeof color.hex === "string",
  );
}

export function hasVariantInventory(colors: ProductColor[]) {
  return colors.some((color) => Array.isArray(color.inventory));
}

export function getInventoryTotal(colors: ProductColor[]) {
  return colors.reduce((total, color) => total + (color.inventory ?? []).reduce(
    (sum, entry) => sum + (Number.isSafeInteger(entry.quantity) ? entry.quantity : 0), 0,
  ), 0);
}

export function getVariantStock(product: { colors: unknown; stock: number; sizes: number[] }, hex: string | null, size: number | null) {
  const colors = getProductColors(product.colors);
  const color = colors.find((entry) => entry.hex.toLowerCase() === hex?.toLowerCase());
  if (!color || size === null || !product.sizes.includes(size)) return 0;
  if (!hasVariantInventory(colors)) return product.stock;
  return color.inventory?.find((entry) => entry.size === size)?.quantity ?? 0;
}

export function getColorImage(images: string[], colors: ProductColor[], hex: string | null) {
  const image = colors.find((color) => color.hex.toLowerCase() === hex?.toLowerCase())?.image;
  return image && images.includes(image) ? image : images[0] ?? "";
}
