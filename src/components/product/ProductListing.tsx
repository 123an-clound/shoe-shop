"use client";

import { Suspense, useMemo, useState, type SetStateAction } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { FilterBar } from "@/components/product/FilterBar";
import { ProductResultsGrid } from "@/components/product/ProductResultsGrid";
import { Drawer } from "@/components/ui/Drawer";
import { SORT_LABEL, sortProducts, readFilters, writeFilters, type Filters, type SortOption } from "@/lib/productFilters";
import type { ProductSummary } from "@/lib/queries/products";
import type { Category } from "@/lib/queries/categories";
import type { ProductColor } from "@/types";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";

function ProductListingInner({
  products,
  categories,
  locale,
}: {
  products: ProductSummary[];
  categories: Category[];
  locale: Locale;
}) {
  const copy = getMessages(locale).product;
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

  const filters = useMemo(() => readFilters(searchParams.toString(), categories, priceBounds), [searchParams, categories, priceBounds]);
  function setFilters(update: SetStateAction<Filters>) {
    const next = typeof update === "function" ? update(filters) : update;
    const query = writeFilters(searchParams.toString(), next, categories, priceBounds);
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const visiblePages = Math.min(100, Math.max(1, Number(searchParams.get("page")) || 1));

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
        const productHexes = (product.colors as ProductColor[]).map((c) => c.hex.toLowerCase());
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
      locale={locale}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          {copy.all}
        </h1>
        <button
          type="button"
          onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setMobileFiltersOpen(true); }}
          className="glass flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm text-fg lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {copy.filters}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">{filterBar}</aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p role="status" className="text-sm text-fg-muted">{copy.count.replace("{{count}}", String(filtered.length))}</p>
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sort: e.target.value as SortOption }))
              }
              aria-label={copy.sort}
              className="h-12 max-w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-base text-fg focus:border-brand focus:outline-2 focus:outline-brand"
            >
              {Object.entries(SORT_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {locale === "en" ? ({ "noi-bat": "Featured", "moi-nhat": "Newest", "gia-tang": "Price: low to high", "gia-giam": "Price: high to low", "danh-gia-cao": "Top rated" }[value] ?? label) : label}
                </option>
              ))}
            </select>
          </div>

          <ProductResultsGrid products={filtered.slice(0, visiblePages * 24)} onResetFilters={resetFilters} locale={locale} />
          {filtered.length > visiblePages * 24 && <button type="button" className="mx-auto mt-8 flex min-h-12 items-center rounded-full border border-ink-700 px-6 text-base text-fg focus-visible:outline-2 focus-visible:outline-brand" onClick={() => {
            const query = new URLSearchParams(searchParams.toString()); query.set("page", String(visiblePages + 1));
            window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
          }}>{locale === "en" ? "Load more products" : "Xem thêm sản phẩm"}</button>}
        </div>
      </div>

      <Drawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        side="bottom"
        title={copy.filters}
        closeLabel={locale === "en" ? "Close filters" : "Đóng bộ lọc"}
        footer={<div className="flex items-center justify-between gap-3">
          <button type="button" onClick={resetFilters} className="min-h-12 px-3 text-sm text-fg-muted focus-visible:outline-2 focus-visible:outline-brand">{locale === "en" ? "Clear filters" : "Xóa bộ lọc"}</button>
          <button type="button" onClick={() => setMobileFiltersOpen(false)} className="min-h-12 rounded-full bg-brand px-5 text-sm font-medium text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{copy.count.replace("{{count}}", String(filtered.length))}</button>
        </div>}
      >
        {filterBar}
      </Drawer>
    </div>
  );
}

export function ProductListing(props: { products: ProductSummary[]; categories: Category[]; locale: Locale }) {
  return (
    <Suspense fallback={<div role="status" className="mx-auto max-w-7xl px-4 py-12 text-fg-muted">{props.locale === "en" ? "Loading products…" : "Đang tải sản phẩm…"}</div>}>
      <ProductListingInner {...props} />
    </Suspense>
  );
}
