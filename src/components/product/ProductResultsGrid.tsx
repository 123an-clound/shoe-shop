"use client";

import { ProductCard } from "@/components/product/ProductCard";
import type { ProductSummary } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";

export function ProductResultsGrid({
  products,
  onResetFilters,
  locale = "vi",
}: {
  products: ProductSummary[];
  onResetFilters: () => void;
  locale?: Locale;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-fg-muted">{locale === "en" ? "No products match these filters." : "Không tìm thấy sản phẩm phù hợp bộ lọc."}</p>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-sm font-medium text-brand hover:underline"
        >
          {locale === "en" ? "Clear filters" : "Xóa bộ lọc"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-4 sm:gap-6 md:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-0"
          >
            <ProductCard product={product} locale={locale} />
          </div>
        ))}
    </div>
  );
}
