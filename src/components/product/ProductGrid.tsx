import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/lib/queries/products";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-fg-muted">
        Chưa có sản phẩm nào để hiển thị.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <Reveal key={product.id} delay={(index % 4) * 0.05}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
