"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Native modal supplies focus containment, inert background and Escape support. */
export function Drawer({ open, onClose, side = "right", title, children, footer, closeLabel = "Đóng" }: {
  open: boolean; onClose: () => void; side?: "right" | "bottom" | "full"; title: string;
  children: ReactNode; footer?: ReactNode; closeLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);
  return <dialog ref={dialogRef} aria-labelledby={titleId} className="shop-dialog"
    onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter((node) => node.getClientRects().length > 0 && node.tabIndex >= 0);
      const first = controls[0], last = controls.at(-1);
      if (first && last && ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    {open && <div data-side={side} className={cn("shop-dialog-panel absolute flex min-h-0 flex-col gap-4 border border-ink-700 bg-ink-950 p-5 sm:p-6",
      side === "right" ? "inset-y-0 right-0 w-full max-w-sm" : side === "full" ? "inset-0" : "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[var(--radius-card)]")}>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h2 id={titleId} className="font-display text-lg font-bold text-fg">{title}</h2>
        <button ref={closeRef} type="button" aria-label={closeLabel} onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fg hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-brand">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="shrink-0 border-t border-ink-700 pt-4">{footer}</div>}
    </div>}
  </dialog>;
}
