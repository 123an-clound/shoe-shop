"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

type Theme = "dark" | "light";
const STORAGE_KEY = "veloce-theme";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("veloce-theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("veloce-theme-change", onChange);
  };
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");
  const { messages } = useLocaleContext();

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event("veloce-theme-change"));
  }

  const label = theme === "dark" ? messages.controls.light : messages.controls.dark;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`${messages.controls.theme}: ${label}`}
      title={`${messages.controls.theme}: ${label}`}
      className="flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-ink-800 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
