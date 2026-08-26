import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import type { Product } from "@/lib/queries/products";

export function Stats({ products }: { products: Product[] }) {
  const avgRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
      : 0;

  const items = [
    { to: products.length, decimals: 0, suffix: "", caption: "Mẫu giày đang bán" },
    { to: avgRating, decimals: 1, suffix: "/5", caption: "Đánh giá trung bình" },
    { to: 30, decimals: 0, suffix: " ngày", caption: "Đổi trả miễn phí" },
    { to: 63, decimals: 0, suffix: " tỉnh thành", caption: "Giao hàng toàn quốc" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-8 rounded-[var(--radius-card)] border border-ink-700 bg-ink-900/60 p-8 sm:p-10 md:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.caption} delay={index * 0.05} className="text-center">
            <div className="font-display text-3xl font-bold text-fg tabular-nums sm:text-4xl">
              <CountUp to={item.to} decimals={item.decimals} suffix={item.suffix} />
            </div>
            <p className="mt-2 text-sm text-fg-muted">{item.caption}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
