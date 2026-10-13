import { BadgePercent, Diamond, Flame, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/cn";
import { getMessages, type Locale } from "@/lib/i18n/messages";

// Product stickers have their own palette; admin status badges retain their styles.
const presentations = {
  NEW: { label: "new", Icon: Sparkles, className: "bg-[var(--product-badge-new-bg)] text-[var(--product-badge-new-fg)]" },
  SALE: { label: "sale", Icon: BadgePercent, className: "bg-[var(--product-badge-sale-bg)] text-[var(--product-badge-sale-fg)]" },
  HOT: { label: "hot", Icon: Flame, className: "bg-[var(--product-badge-hot-bg)] text-[var(--product-badge-hot-fg)]" },
  LIMITED: { label: "limited", Icon: Diamond, className: "bg-[var(--product-badge-limited-bg)] text-[var(--product-badge-limited-fg)]" },
} as const;

export function ProductBadge({ badge, discountPercent, locale = "vi" }: { badge?: string; discountPercent?: number; locale?: Locale }) {
  if (discountPercent !== undefined && (!Number.isFinite(discountPercent) || discountPercent <= 0)) return null;
  if (!badge && discountPercent === undefined) return null;
  const kind = discountPercent !== undefined ? "SALE" : badge;
  const presentation = kind && Object.hasOwn(presentations, kind) ? presentations[kind as keyof typeof presentations] : null;
  const Icon = presentation?.Icon ?? Tag;
  const label = discountPercent !== undefined ? `-${discountPercent}%` : presentation ? getMessages(locale).product[presentation.label] : badge;

  return <span className={cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/30 px-2.5 py-1.5 text-xs font-extrabold leading-4 tabular-nums shadow-[0_2px_8px_rgb(0_0_0/20%)]",
    presentation?.className ?? "bg-ink-900 text-fg",
    discountPercent !== undefined && "text-sm",
  )} data-product-badge={kind}>
    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
    <span className="min-w-0 break-words">{label}</span>
  </span>;
}
