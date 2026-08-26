"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { FilterBar } from "@/components/product/FilterBar";
import { ProductResultsGrid } from "@/components/product/ProductResultsGrid";
import { Drawer } from "@/components/ui/Drawer";
import { SORT_LABEL, sortProducts, type Filters, type SortOption } from "@/lib/productFilters";
import type { Product } from "@/lib/queries/products";
import type { Category } from "@/lib/queries/categories";
import type { ProductColor } from "@/types";

function ProductListingInner({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();

  const priceBounds = useMemo<[number, number]>(() => {
    if (products.length === 0) return [0, 0];
    const prices = products.map((p) => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [products]);

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => a - b),
    [products],
  );

  const availableColors = useMemo(() => {
    const map = new Map<string, ProductColor>();
    for (const product of products) {
      for (const color of product.colors as ProductColor[]) {
        if (!map.has(color.hex)) map.set(color.hex, color);
      }
    }
    return Array.from(map.values());
  }, [products]);

  const [filters, setFilters] = useState<Filters>(() => {
    const categorySlug = searchParams.get("danh-muc");
    const category = categories.find((c) => c.slug === categorySlug)?.id ?? null;
    return {
      category,
      priceRange: priceBounds,
      sizes: [],
      colors: [],
      saleOnly: false,
      sort: searchParams.get("sort") === "moi-nhat" ? "moi-nhat" : "noi-bat",
    };
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      if (filters.category && product.category_id !== filters.category) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      if (filters.sizes.length > 0 && !filters.sizes.some((s) => product.sizes.includes(s))) {
        return false;
      }
      if (filters.colors.length > 0) {
        const productHexes = (product.colors as ProductColor[]).map((c) => c.hex);
        if (!filters.colors.some((hex) => productHexes.includes(hex))) return false;
      }
      if (filters.saleOnly && !product.original_price) return false;
      return true;
    });
    return sortProducts(result, filters.sort);
  }, [products, filters]);

  function resetFilters() {
    setFilters({
      category: null,
      priceRange: priceBounds,
      sizes: [],
      colors: [],
      saleOnly: false,
      sort: "noi-bat",
    });
  }

  const filterBar = (
    <FilterBar
      categories={categories}
      availableSizes={availableSizes}
      availableColors={availableColors}
      priceBounds={priceBounds}
      filters={filters}
      onChange={setFilters}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          Tất cả sản phẩm
        </h1>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="glass flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm text-fg lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Bộ lọc
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">{filterBar}</aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-fg-muted">{filtered.length} sản phẩm</p>
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))
              }
              aria-label="Sắp xếp"
              className="h-10 rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm text-fg focus:border-brand focus:outline-none"
            >
              {Object.entries(SORT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <ProductResultsGrid products={filtered} onResetFilters={resetFilters} />
        </div>
      </div>

      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        side="bottom"
        title="Bộ lọc"
      >
        {filterBar}
      </Drawer>
    </div>
  );
}

export function ProductListing(props: { products: Product[]; categories: Category[] }) {
  return (
    <Suspense fallback={null}>
      <ProductListingInner {...props} />
    </Suspense>
  );
}
