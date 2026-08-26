import { getSettings } from "@/lib/queries/settings";
import { getProducts } from "@/lib/queries/products";
import { ProductGrid } from "@/components/product/ProductGrid";

export default async function HomePage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 pb-16 text-center">
        <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">
          {settings.hero_headline ?? settings.store_name}
        </h1>
        {settings.hero_subheadline && (
          <p className="max-w-xl text-fg-muted">{settings.hero_subheadline}</p>
        )}
        <p className="mt-2 text-sm text-fg-subtle">
          Trang chủ đầy đủ (Hero, ScrollStory, Marquee…) sẽ được xây ở Phase 3.
          Bên dưới là xem trước lưới sản phẩm của Phase 2.
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
