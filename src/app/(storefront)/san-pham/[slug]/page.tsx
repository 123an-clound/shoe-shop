import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/queries/products";
import { Gallery } from "@/components/product/Gallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatVND } from "@/lib/format";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category_id
    ? await getRelatedProducts(product.category_id, product.slug)
    : [];

  const discountPercent = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Gallery images={product.images} productName={product.name} />

        <div>
          <p className="text-sm text-fg-subtle">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-fg sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            {product.badge && <Badge tone="lime">{product.badge}</Badge>}
            <div className="flex items-center gap-1 text-sm text-fg-muted">
              <Star className="h-4 w-4 fill-neon-lime text-neon-lime" aria-hidden="true" />
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
              <span>({product.review_count} đánh giá)</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold tabular-nums text-fg">
              {formatVND(product.price)}
            </span>
            {product.original_price && (
              <>
                <span className="tabular-nums text-lg text-fg-subtle line-through">
                  {formatVND(product.original_price)}
                </span>
                {discountPercent !== null && <Badge tone="brand">-{discountPercent}%</Badge>}
              </>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className="mt-2 text-sm text-brand-2">Chỉ còn {product.stock} đôi</p>
          )}

          <div className="mt-8">
            <ProductPurchasePanel product={product} />
          </div>

          <div className="mt-10">
            <Tabs
              tabs={[
                {
                  id: "mo-ta",
                  label: "Mô tả",
                  content: <p className="text-fg-muted">{product.description}</p>,
                },
                {
                  id: "thong-so",
                  label: "Thông số",
                  content: (
                    <ul className="flex flex-col gap-2 text-fg-muted">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <span className="text-brand">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "danh-gia",
                  label: "Đánh giá",
                  content: (
                    <div className="flex items-center gap-3 text-fg-muted">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < Math.round(product.rating)
                                ? "h-4 w-4 fill-neon-lime text-neon-lime"
                                : "h-4 w-4 text-ink-700"
                            }
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className="tabular-nums">{product.rating.toFixed(1)}/5</span>
                      <span>· {product.review_count} lượt đánh giá</span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">
            Có thể bạn thích
          </h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </div>
      )}
    </div>
  );
}
