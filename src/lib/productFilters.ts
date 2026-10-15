import type { ProductSummary } from "@/lib/queries/products";

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

type FilterCategory = { id: string; slug: string };
export function readFilters(query: string, categories: FilterCategory[], bounds: [number, number]): Filters {
  const params = new URLSearchParams(query);
  const price = (key: string, fallback: number) => {
    const raw = params.get(key);
    if (!raw || !/^\d{1,12}$/.test(raw)) return fallback;
    return Math.max(bounds[0], Math.min(bounds[1], Number(raw)));
  };
  const low = price("min", bounds[0]), high = price("max", bounds[1]);
  const sort = params.get("sort") || "";
  return {
    category: categories.find((item) => item.slug === params.get("danh-muc"))?.id ?? null,
    priceRange: [Math.min(low, high), Math.max(low, high)],
    sizes: [...new Set((params.get("size") || "").slice(0,500).split(",").filter((item) => /^\d{1,3}$/.test(item)).map(Number))],
    colors: [...new Set((params.get("color") || "").slice(0,500).split(",").filter((item) => /^#[0-9a-f]{6}$/i.test(item)).map((item) => item.toLowerCase()))],
    saleOnly: params.get("sale") === "1",
    sort: Object.hasOwn(SORT_LABEL, sort) ? sort as SortOption : "noi-bat",
  };
}

export function writeFilters(query: string, filters: Filters, categories: FilterCategory[], bounds: [number, number]) {
  const params = new URLSearchParams(query);
  for (const key of ["danh-muc", "min", "max", "size", "color", "sale", "sort", "page"]) params.delete(key);
  const category = categories.find((item) => item.id === filters.category);
  if (category) params.set("danh-muc", category.slug);
  if (filters.priceRange[0] !== bounds[0]) params.set("min", String(filters.priceRange[0]));
  if (filters.priceRange[1] !== bounds[1]) params.set("max", String(filters.priceRange[1]));
  if (filters.sizes.length) params.set("size", filters.sizes.join(","));
  if (filters.colors.length) params.set("color", filters.colors.join(","));
  if (filters.saleOnly) params.set("sale", "1");
  if (filters.sort !== "noi-bat") params.set("sort", filters.sort);
  return params.toString();
}

export function sortProducts(products: ProductSummary[], sort: SortOption): ProductSummary[] {
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
