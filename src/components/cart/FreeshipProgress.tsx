import { formatVND } from "@/lib/format";

/** Thanh tiến trình freeship — ngưỡng đọc từ `settings.freeship_threshold` (mục 5.4 PLAN.md). */
export function FreeshipProgress({
  subtotal,
  threshold,
}: {
  subtotal: number;
  threshold: number;
}) {
  const remaining = Math.max(0, threshold - subtotal);
  const progress = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-3 text-xs">
      {remaining > 0 ? (
        <p className="text-fg-muted">
          Mua thêm <span className="font-medium text-brand">{formatVND(remaining)}</span> nữa
          để được miễn phí vận chuyển
        </p>
      ) : (
        <p className="text-neon-lime">Đơn hàng của bạn được miễn phí vận chuyển</p>
      )}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
