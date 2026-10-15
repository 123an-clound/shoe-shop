"use client";
import { lazy, Suspense } from "react";
import { useCartStore } from "@/store/cart";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";
const CartDrawer = lazy(() => import("./CartDrawer").then((module) => ({ default: module.CartDrawer })));

export function CartDrawerLoader({ freeshipThreshold }: { freeshipThreshold: number }) {
  const open = useCartStore((state) => state.isOpen);
  const { locale } = useLocaleContext();
  if (!open) return null;
  return <Suspense fallback={<p role="status" className="fixed right-4 top-20 z-[60] rounded-lg bg-ink-900 p-4 text-fg">{locale === "en" ? "Opening cart…" : "Đang mở giỏ hàng…"}</p>}><CartDrawer freeshipThreshold={freeshipThreshold} /></Suspense>;
}
