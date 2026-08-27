"use client";

import { COLOR_PRESETS, type ColorPreset } from "@/lib/validation/settings";

export function ColorPresetButtons({ onSelect }: { onSelect: (preset: ColorPreset) => void }) {
  return (
    <div>
      <p className="text-sm text-fg-muted">Bộ màu dựng sẵn</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset)}
            className="flex items-center gap-2 rounded-full border border-ink-700 px-3 py-2 text-xs text-fg-muted transition-colors hover:border-brand hover:text-fg"
          >
            <span className="flex -space-x-1">
              <span
                className="h-4 w-4 rounded-full border border-ink-950"
                style={{ backgroundColor: preset.primary }}
              />
              <span
                className="h-4 w-4 rounded-full border border-ink-950"
                style={{ backgroundColor: preset.secondary }}
              />
              <span
                className="h-4 w-4 rounded-full border border-ink-950"
                style={{ backgroundColor: preset.accent }}
              />
            </span>
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
