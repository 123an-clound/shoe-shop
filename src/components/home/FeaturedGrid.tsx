import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/lib/queries/products";

export function FeaturedGrid({ products }: { products: Product[] }) {
  const featured = products.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
            Sản phẩm nổi bật
          </h2>
          <p className="mt-2 text-fg-muted">
            Những đôi được chọn mua nhiều nhất tuần này.
          </p>
        </div>
        <Link
          href="/san-pham"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand hover:underline sm:flex"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Reveal>

      <div className="mt-10">
        <ProductGrid products={featured} />
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/san-pham"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
