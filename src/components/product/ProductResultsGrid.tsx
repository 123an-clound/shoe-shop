"use client";

import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";

export function ProductResultsGrid({
  products,
  onResetFilters,
  locale = "vi",
}: {
  products: Product[];
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
    <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard product={product} locale={locale} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
