import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages, localizedHref } from "@/lib/i18n/messages";

export function FeaturedGrid({ products, locale }: { products: Product[]; locale: Locale }) {
  const featured = products.slice(0, 8);
  const copy = getMessages(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
            {copy.home.featured}
          </h2>
          <p className="mt-2 text-fg-muted">
            {copy.home.featuredIntro}
          </p>
        </div>
        <Link
          href={localizedHref("/san-pham", locale)}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-brand hover:underline sm:flex"
        >
          {copy.home.all}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Reveal>

      <div className="mt-10">
        <ProductGrid products={featured} locale={locale} />
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href={localizedHref("/san-pham", locale)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          {copy.home.all}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
