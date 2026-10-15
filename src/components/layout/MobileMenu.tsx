"use client";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { ThemeToggle } from "@/components/i18n/ThemeToggle";

export function MobileMenu({ storeName, navItems }: { storeName: string; navItems: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const { messages } = useLocaleContext();
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return <>
    <button type="button" aria-label={messages.controls.openMenu} aria-haspopup="dialog" aria-expanded={open}
      onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setOpen(true); }} className="flex h-11 w-11 items-center justify-center rounded-full text-fg hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-brand lg:hidden">
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
    <Drawer open={open} onClose={() => setOpen(false)} title={storeName} closeLabel={messages.controls.closeMenu}
      footer={<div className="flex items-center justify-between"><LanguageSwitch /><ThemeToggle /></div>}>
      <nav aria-label={messages.controls.openMenu} className="flex flex-col gap-1">
        {navItems.map((item) => <LocaleLink key={item.href} href={item.href} onClick={() => setOpen(false)}
          className="flex min-h-12 items-center rounded-lg px-3 py-3 text-base text-fg-muted hover:bg-ink-800 hover:text-fg focus-visible:outline-2 focus-visible:outline-brand">{item.label}</LocaleLink>)}
      </nav>
    </Drawer>
  </>;
}
