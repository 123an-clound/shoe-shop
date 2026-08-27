"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useCartHydrated, useCartStore } from "@/store/cart";

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function Header({ storeName }: { storeName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const hydrated = useCartHydrated();
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const openCart = useCartStore((state) => state.openCart);
  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 500);
      prevCount.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = itemCount;
  }, [itemCount]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "glass" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-fg"
        >
          {storeName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-fg-muted transition-colors hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            id="header-cart-icon"
            type="button"
            onClick={openCart}
            aria-label={`Mở giỏ hàng${hydrated && itemCount > 0 ? `, ${itemCount} sản phẩm` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/5"
          >
            <ShoppingBag
              className={cn("h-5 w-5", bounce && "animate-bounce")}
              aria-hidden="true"
            />
            {hydrated && itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium tabular-nums text-ink-950">
                {itemCount}
              </span>
            )}
          </button>
          <MobileMenu storeName={storeName} navItems={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
