"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useCartHydrated, useCartStore } from "@/store/cart";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { ThemeToggle } from "@/components/i18n/ThemeToggle";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

export function Header({ storeName }: { storeName: string }) {
  const { messages } = useLocaleContext();
  const navItems = [
    { href: "/", label: messages.nav.home },
    { href: "/san-pham", label: messages.nav.products },
    { href: "/ve-chung-toi", label: messages.nav.about },
    { href: "/lien-he", label: messages.nav.contact },
  ];
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
        <LocaleLink
          href="/"
          className="font-display text-xl font-bold tracking-tight text-fg"
        >
          {storeName}
        </LocaleLink>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <LocaleLink
              key={item.href}
              href={item.href}
              className="text-sm text-fg-muted transition-colors hover:text-fg"
            >
              {item.label}
            </LocaleLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex"><LanguageSwitch /><ThemeToggle /></div>
          <button
            id="header-cart-icon"
            type="button"
            onClick={openCart}
            aria-label={`${messages.controls.openCart}${hydrated && itemCount > 0 ? `, ${itemCount}` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/5"
          >
            <ShoppingBag
              className={cn("h-5 w-5", bounce && "animate-bounce")}
              aria-hidden="true"
            />
            {hydrated && itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium tabular-nums text-on-brand">
                {itemCount}
              </span>
            )}
          </button>
          <MobileMenu storeName={storeName} navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
