"use client";

import { ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { FreeshipProgress } from "@/components/cart/FreeshipProgress";
import { useCartStore } from "@/store/cart";
import { formatVND } from "@/lib/format";

export function CartDrawer({ freeshipThreshold }: { freeshipThreshold: number }) {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Drawer open={isOpen} onClose={closeCart} side="right" title="Giỏ hàng">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-fg-subtle" aria-hidden="true" />
          <p className="text-fg-muted">Giỏ hàng đang trống.</p>
          <Button href="/san-pham" variant="glass" onClick={closeCart}>
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <div className="flex h-full flex-col gap-6">
          <FreeshipProgress subtotal={subtotal} threshold={freeshipThreshold} />

          <ul className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {items.map((item) => (
              <CartItemRow key={`${item.productId}-${item.size}-${item.color}`} item={item} />
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-ink-700 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Tạm tính</span>
              <span className="tabular-nums font-medium text-fg">{formatVND(subtotal)}</span>
            </div>
            <Button href="/thanh-toan" onClick={closeCart}>
              Thanh toán
            </Button>
            <Button href="/gio-hang" variant="ghost" onClick={closeCart}>
              Xem giỏ hàng đầy đủ
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
