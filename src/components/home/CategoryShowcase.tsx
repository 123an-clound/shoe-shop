import Image from "next/image";
import Link from "next/link";
import { Briefcase, Diamond, Footprints, Mountain, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import type { Category } from "@/lib/queries/categories";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages, localizedHref } from "@/lib/i18n/messages";

const CATEGORY_ICON: Record<string, typeof Footprints> = {
  sneaker: Footprints,
  "the-thao": Zap,
  "giay-da": Briefcase,
  loafer: Diamond,
  boot: Mountain,
};

export function CategoryShowcase({ categories, locale }: { categories: Category[]; locale: Locale }) {
  const copy = getMessages(locale);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          {copy.home.categories}
        </h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICON[category.slug] ?? Footprints;

          return (
            <Reveal key={category.id} delay={(index % 5) * 0.05}>
              <Link
                href={localizedHref(`/san-pham?danh-muc=${category.slug}`, locale)}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[image:var(--gradient-aurora)] opacity-70 transition-transform duration-500 ease-out group-hover:scale-[1.08]">
                    <Icon
                      className="h-12 w-12 text-ink-950/70"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent transition-opacity duration-300 group-hover:from-ink-950/95" />

                <span className="absolute inset-x-0 bottom-0 p-4 font-display text-lg font-medium text-fg transition-transform duration-300 ease-out group-hover:-translate-y-1">
                  {locale === "en" ? category.name_en || category.name : category.name}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
