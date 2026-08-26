"use client";

import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/queries/products";

export function ProductResultsGrid({
  products,
  onResetFilters,
}: {
  products: Product[];
  onResetFilters: () => void;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-fg-muted">Không tìm thấy sản phẩm phù hợp bộ lọc.</p>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-sm font-medium text-brand hover:underline"
        >
          Xóa bộ lọc
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
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
