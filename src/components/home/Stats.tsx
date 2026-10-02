import type { Product } from "@/lib/queries/products";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";

export function Stats({
  products,
  categoryCount,
  locale,
}: {
  products: Product[];
  categoryCount: number;
  locale: Locale;
}) {
  const copy = getMessages(locale).home;
  const items = [
    { value: products.length, caption: copy.statsProducts },
    { value: categoryCount, caption: copy.statsCategories },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 rounded-[var(--radius-card)] border border-ink-700 bg-ink-900/60 p-8 sm:p-10">
        {items.map((item) => (
          <div key={item.caption} className="text-center">
            <div className="font-display text-3xl font-bold text-fg tabular-nums sm:text-4xl">
              {item.value}
            </div>
            <p className="mt-2 text-sm text-fg-muted">{item.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
