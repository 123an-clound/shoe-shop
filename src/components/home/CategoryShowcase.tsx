import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Briefcase, Diamond, Footprints, Mountain, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import type { Category } from "@/lib/queries/categories";
import type { Product } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages, localizedHref } from "@/lib/i18n/messages";

const CATEGORY_ICON: Record<string, typeof Footprints> = {
  sneaker: Footprints,
  "the-thao": Zap,
  "giay-da": Briefcase,
  loafer: Diamond,
  boot: Mountain,
};

export function CategoryShowcase({ categories, products, locale }: {
  categories: Category[];
  products: Product[];
  locale: Locale;
}) {
  const copy = getMessages(locale);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="motion-reduce:opacity-100! motion-reduce:transform-none!">
        <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          {copy.home.categories}
        </h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICON[category.slug] ?? Footprints;
          const representative = products.find((product) =>
            product.category_id === category.id && product.is_published && product.images.some((image) => image.trim()),
          );
          const imageUrl = category.image_url?.trim() || representative?.images.find((image) => image.trim());
          const name = locale === "en" ? category.name_en || category.name : category.name;

          return (
            <Reveal key={category.id} delay={(index % 5) * 0.05} className="motion-reduce:opacity-100! motion-reduce:transform-none!">
              <Link
                href={localizedHref(`/san-pham?danh-muc=${category.slug}`, locale)}
                className="group block overflow-hidden rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-ink-800">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 228px, (min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon
                        className="h-12 w-12 text-fg-muted"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <div className="flex min-h-16 items-center justify-between gap-2 p-3 sm:p-4">
                  <span className="font-display text-base font-semibold leading-snug text-fg sm:text-lg">{name}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-800 text-fg" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
