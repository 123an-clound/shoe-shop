"use client";

import { ContrastWarning } from "@/components/admin/ContrastWarning";

export function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-fg-muted">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-ink-700 bg-ink-900 p-1"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 flex-1 rounded-lg border border-ink-700 bg-ink-900 px-4 text-sm tabular-nums text-fg focus:border-brand focus:outline-none"
        />
      </div>
      <ContrastWarning hex={value} label={label} />
    </div>
  );
}
