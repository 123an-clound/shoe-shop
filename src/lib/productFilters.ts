import type { Product } from "@/lib/queries/products";

export type SortOption = "noi-bat" | "moi-nhat" | "gia-tang" | "gia-giam" | "danh-gia-cao";

export type Filters = {
  category: string | null;
  priceRange: [number, number];
  sizes: number[];
  colors: string[];
  saleOnly: boolean;
  sort: SortOption;
};

export const SORT_LABEL: Record<SortOption, string> = {
  "noi-bat": "Nổi bật",
  "moi-nhat": "Mới nhất",
  "gia-tang": "Giá tăng dần",
  "gia-giam": "Giá giảm dần",
  "danh-gia-cao": "Đánh giá cao",
};

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "moi-nhat":
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case "gia-tang":
      return sorted.sort((a, b) => a.price - b.price);
    case "gia-giam":
      return sorted.sort((a, b) => b.price - a.price);
    case "danh-gia-cao":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted.sort((a, b) => a.sort_order - b.sort_order);
  }
}
