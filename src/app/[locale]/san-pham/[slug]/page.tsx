import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/queries/products";
import { Gallery } from "@/components/product/Gallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { formatVND } from "@/lib/format";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";
import { localizedAlternates, SITE_URL } from "@/lib/seo";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = locale === "en" ? product.name_en || product.name : product.name;
  const description = locale === "en" ? product.description_en || product.description : product.description;
  const viPath = `/san-pham/${slug}`;
  const enPath = `/en${viPath}`;

  return {
    title: name,
    description,
    alternates: localizedAlternates(locale, viPath, enPath),
    openGraph: {
      title: name,
      description,
      locale: locale === "en" ? "en_US" : "vi_VN",
      type: "website",
      images: product.images[0] ? [product.images[0]] : undefined,
    },
    twitter: { card: "summary_large_image", title: name, description },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const copy = getMessages(locale).product;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const name = locale === "en" ? product.name_en || product.name : product.name;
  const description = locale === "en" ? product.description_en || product.description : product.description;
  const features = locale === "en" ? product.features_en || product.features : product.features;
  const productUrl = new URL(locale === "en" ? `/en/san-pham/${slug}` : `/san-pham/${slug}`, SITE_URL).toString();
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    image: product.images,
    description,
    sku: product.slug,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "VND",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const related = product.category_id
    ? await getRelatedProducts(product.category_id, product.slug)
    : [];

  const discountPercent = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData).replace(/</g, "\\u003c") }}
      />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Gallery images={product.images} productName={name} />

        <div>
          <p className="text-sm text-fg-subtle">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-fg sm:text-4xl">
            {name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            {product.badge && <Badge tone="lime">{product.badge}</Badge>}
            <div className="flex items-center gap-1 text-sm text-fg-muted">
              <Star className="h-4 w-4 fill-neon-lime text-neon-lime" aria-hidden="true" />
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
              <span>({product.review_count} {copy.reviews})</span>
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
            <p className="mt-2 text-sm text-brand-2">{copy.lowStock.replace("{{count}}", String(product.stock))}</p>
          )}

          <div className="mt-8">
            <ProductPurchasePanel product={product} />
          </div>

          <div className="mt-10">
            <Tabs
              tabs={[
                {
                  id: "mo-ta",
                  label: copy.description,
                  content: <p className="text-fg-muted">{description}</p>,
                },
                {
                  id: "thong-so",
                  label: copy.specs,
                  content: (
                    <ul className="flex flex-col gap-2 text-fg-muted">
                      {features.map((feature) => (
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
                  label: copy.rating,
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
                      <span>· {copy.reviewsCount.replace("{{count}}", String(product.review_count))}</span>
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
            {copy.related}
          </h2>
          <div className="mt-8">
            <ProductGrid products={related} locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}
