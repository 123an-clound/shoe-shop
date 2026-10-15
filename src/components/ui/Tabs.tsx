"use client";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { navigateOptions } from "@/lib/keyboard";
type Tab = { id: string; label: string; content: ReactNode };

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const prefix = useId();
  return <div className="min-w-0">
    <div role="tablist" aria-label="Thông tin sản phẩm / Product information" className="flex gap-4 border-b border-ink-700 sm:gap-6" onKeyDown={navigateOptions}>
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" id={`${prefix}-${tab.id}`} aria-controls={`${prefix}-${tab.id}-panel`}
        aria-selected={active === tab.id} tabIndex={active === tab.id ? 0 : -1} onClick={() => setActive(tab.id)}
        className={cn("min-h-11 border-b-2 px-1 pb-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand",
          active === tab.id ? "border-brand text-fg" : "border-transparent text-fg-muted hover:text-fg")}>{tab.label}</button>)}
    </div>
    {tabs.map((tab) => <div key={tab.id} role="tabpanel" id={`${prefix}-${tab.id}-panel`} aria-labelledby={`${prefix}-${tab.id}`} hidden={active !== tab.id} tabIndex={0} className="min-w-0 pt-6 [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-brand">{active === tab.id ? tab.content : null}</div>)}
  </div>;
}
