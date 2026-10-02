"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  nameEn?: string;
  price: number;
  image: string;
  size: number;
  color: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: number, color: string) => void;
  updateQuantity: (
    productId: string,
    size: number,
    color: string,
    quantity: number,
  ) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

function sameLine(a: CartItem, productId: string, size: number, color: string) {
  return a.productId === productId && a.size === size && a.color === color;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, item.size, item.color),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, size, color)),
        })),

      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, size, color) ? { ...i, quantity } : i,
          ),
        })),

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "veloce-cart",
      // Chỉ lưu danh sách sản phẩm — isOpen là state UI tạm thời, không cần persist.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/**
 * Zustand persist đọc localStorage bất đồng bộ sau khi mount, nên lần render đầu
 * trên client trùng với server (mảng rỗng). Dùng hook này ở nơi cần hiển thị số
 * lượng/giỏ hàng thật để tránh chớp nội dung sai trước khi hydrate xong.
 */
export function useCartHydrated() {
  return useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
