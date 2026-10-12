"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { cn } from "@/lib/cn";

export function AdminThemeToggle() {
  const { theme, setTheme } = useAdminTheme();
  return (
    <div role="group" aria-label="Giao diện quản trị" className="inline-flex rounded-xl border border-ink-700 bg-ink-950 p-1">
      {([{ value: "light", label: "Sáng", icon: Sun }, { value: "dark", label: "Tối", icon: Moon }] as const).map((option) => {
        const Icon = option.icon;
        return (
          <button key={option.value} type="button" aria-pressed={theme === option.value} onClick={() => setTheme(option.value)}
            className={cn("flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand", theme === option.value ? "bg-ink-900 text-brand shadow-sm" : "text-fg-muted hover:bg-ink-800 hover:text-fg")}>
            <Icon className="h-4 w-4" aria-hidden="true" />{option.label}
          </button>
        );
      })}
    </div>
  );
}
