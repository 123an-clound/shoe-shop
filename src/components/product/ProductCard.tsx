import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { ProductBadge } from "@/components/product/ProductBadge";
import { TiltCard } from "@/components/ui/TiltCard";
import { formatVND } from "@/lib/format";
import type { ProductSummary } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages, localizedHref } from "@/lib/i18n/messages";

export function ProductCard({ product, locale = "vi" }: { product: ProductSummary; locale?: Locale }) {
  const copy = getMessages(locale).product;
  const name = locale === "en" ? product.name_en || product.name : product.name;
  const [primaryImage, secondaryImage] = product.images;
  const discountPercent = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <Link
      href={localizedHref(`/san-pham/${product.slug}`, locale)}
      prefetch={false}
      className="group block h-full rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
    >
      <TiltCard className="glass flex h-full flex-col overflow-hidden rounded-[var(--radius-card)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-800">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={
                  "object-cover transition-[opacity,transform] duration-300 ease-out group-hover:scale-105" +
                  (secondaryImage ? " group-hover:opacity-0" : "")
                }
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="hidden object-cover opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:scale-105 group-hover:opacity-100 lg:block"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-fg-subtle">
              Chưa có ảnh
            </div>
          )}

          <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-col items-start gap-2 sm:left-3 sm:top-3 sm:max-w-[calc(100%-1.5rem)]">
            {product.badge && (
              <ProductBadge badge={product.badge} locale={locale} />
            )}
            {discountPercent !== null && discountPercent > 0 && (
              <ProductBadge discountPercent={discountPercent} locale={locale} />
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
              <span className="text-sm font-medium text-fg">{copy.soldOut}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
          <p className="text-xs text-fg-subtle">{product.brand}</p>
          <h3 className="line-clamp-3 font-display text-base font-medium text-fg [overflow-wrap:anywhere]">{name}</h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
            <Star
              className="h-3.5 w-3.5 fill-neon-lime text-neon-lime"
              aria-hidden="true"
            />
            <span className="tabular-nums">{product.rating.toFixed(1)}</span>
            <span>({product.review_count})</span>
          </div>

          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-3">
            <span className="tabular-nums font-medium text-fg">
              {formatVND(product.price)}
            </span>
            {product.original_price && (
              <span className="tabular-nums text-sm text-fg-subtle line-through">
                {formatVND(product.original_price)}
              </span>
            )}
          </div>

          {lowStock && (
            <p className="mt-1 text-xs text-brand-2">{copy.lowStock.replace("{{count}}", String(product.stock))}</p>
          )}
        </div>
      </TiltCard>
    </Link>
  );
}
