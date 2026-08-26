import { cn } from "@/lib/cn";

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div className="marquee-row">
      <div className={cn("marquee-track gap-6 py-3", reverse && "marquee-track-reverse")}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 font-display text-2xl font-medium text-fg-subtle sm:text-3xl"
          >
            {item}
            <span aria-hidden="true" className="text-brand">
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** 2 hàng chạy ngược chiều, chậm lại khi hover (mục 5.1/6 PLAN.md). */
export function Marquee({ items }: { items: string[] }) {
  return (
    <section
      aria-hidden="true"
      className="border-y border-ink-700 bg-ink-900/60 py-2"
    >
      <Row items={items} />
      <Row items={[...items].reverse()} reverse />
    </section>
  );
}
