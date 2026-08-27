"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** Hộp thoại xác nhận có gõ lại tên — dùng khi xóa sản phẩm/danh mục (mục 5.7 PLAN.md). */
export function ConfirmDialog({
  open,
  title,
  description,
  expectedText,
  confirmLabel = "Xóa",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  expectedText: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const matches = value.trim() === expectedText.trim();

  function handleClose() {
    setValue("");
    onClose();
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
      setValue("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="glass absolute left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] p-6">
        <h2 className="font-display text-lg font-bold text-fg">{title}</h2>
        <p className="mt-2 text-sm text-fg-muted">{description}</p>
        <p className="mt-3 text-sm text-fg-muted">
          Gõ lại <span className="font-medium text-fg">{expectedText}</span> để xác nhận:
        </p>
        <div className="mt-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="glass"
            disabled={!matches || submitting}
            onClick={handleConfirm}
            className="border border-red-500/40 text-red-400 disabled:border-ink-700"
          >
            {submitting ? "Đang xóa..." : confirmLabel}
          </Button>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={handleClose}
          className="sr-only"
          aria-label="Đóng"
        />
      </div>
    </div>
  );
}
