import { formatVND } from "@/lib/format";
import type { CartItem } from "@/store/cart";

export function CheckoutSummary({
  items,
  subtotal,
  error,
}: {
  items: CartItem[];
  subtotal: number;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
        <p className="text-sm font-medium text-fg">Sản phẩm</p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-muted">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex justify-between gap-4"
            >
              <span>
                {item.name} · {item.color} · Size {item.size} × {item.quantity}
              </span>
              <span className="shrink-0 tabular-nums text-fg">
                {formatVND(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-ink-700 pt-3 text-sm">
          <span className="text-fg-muted">Tạm tính (ước tính)</span>
          <span className="tabular-nums font-medium text-fg">{formatVND(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-fg-subtle">
          Số tiền cuối cùng (đã gồm giảm giá, phí ship) do hệ thống tính chính xác sau khi đặt
          hàng.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
