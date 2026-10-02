import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TiltCard } from "@/components/ui/TiltCard";
import { formatVND } from "@/lib/format";
import type { Product } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages, localizedHref } from "@/lib/i18n/messages";

const BADGE_LABEL: Record<string, string> = {
  NEW: "Mới",
  SALE: "Giảm giá",
  HOT: "Bán chạy",
  LIMITED: "Giới hạn",
};

export function ProductCard({ product, locale = "vi" }: { product: Product; locale?: Locale }) {
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
      className="group block rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
    >
      <TiltCard className="glass overflow-hidden rounded-[var(--radius-card)]">
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

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badge && (
              <Badge tone="lime">{locale === "en" ? ({ NEW: "New", SALE: "Sale", HOT: "Bestseller", LIMITED: "Limited" }[product.badge] ?? product.badge) : BADGE_LABEL[product.badge] ?? product.badge}</Badge>
            )}
            {discountPercent !== null && discountPercent > 0 && (
              <Badge tone="brand">-{discountPercent}%</Badge>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
              <span className="text-sm font-medium text-fg">{copy.soldOut}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 p-4">
          <p className="text-xs text-fg-subtle">{product.brand}</p>
          <h3 className="font-display text-base font-medium text-fg">{name}</h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
            <Star
              className="h-3.5 w-3.5 fill-neon-lime text-neon-lime"
              aria-hidden="true"
            />
            <span className="tabular-nums">{product.rating.toFixed(1)}</span>
            <span>({product.review_count})</span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
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
