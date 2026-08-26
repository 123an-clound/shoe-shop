"use client";

import { Check } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/cn";
import { formatVND } from "@/lib/format";
import type { Category } from "@/lib/queries/categories";
import type { ProductColor } from "@/types";
import type { Filters } from "@/lib/productFilters";

export function FilterBar({
  categories,
  availableSizes,
  availableColors,
  priceBounds,
  filters,
  onChange,
}: {
  categories: Category[];
  availableSizes: number[];
  availableColors: ProductColor[];
  priceBounds: [number, number];
  filters: Filters;
  onChange: Dispatch<SetStateAction<Filters>>;
}) {
  function toggleSize(size: number) {
    onChange((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  }

  function toggleColor(hex: string) {
    onChange((f) => ({
      ...f,
      colors: f.colors.includes(hex) ? f.colors.filter((c) => c !== hex) : [...f.colors, hex],
    }));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-fg">Danh mục</p>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="radio"
              name="category"
              checked={filters.category === null}
              onChange={() => onChange((f) => ({ ...f, category: null }))}
              className="accent-brand"
            />
            Tất cả
          </label>
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 text-sm text-fg-muted"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === category.id}
                onChange={() => onChange((f) => ({ ...f, category: category.id }))}
                className="accent-brand"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-fg">Khoảng giá</p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="range"
            min={priceBounds[0]}
            max={priceBounds[1]}
            value={filters.priceRange[0]}
            onChange={(e) => {
              const value = Math.min(Number(e.target.value), filters.priceRange[1]);
              onChange((f) => ({ ...f, priceRange: [value, f.priceRange[1]] }));
            }}
            className="w-full accent-brand"
          />
          <input
            type="range"
            min={priceBounds[0]}
            max={priceBounds[1]}
            value={filters.priceRange[1]}
            onChange={(e) => {
              const value = Math.max(Number(e.target.value), filters.priceRange[0]);
              onChange((f) => ({ ...f, priceRange: [f.priceRange[0], value] }));
            }}
            className="w-full accent-brand"
          />
          <p className="tabular-nums text-xs text-fg-subtle">
            {formatVND(filters.priceRange[0])} — {formatVND(filters.priceRange[1])}
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-fg">Size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              aria-pressed={filters.sizes.includes(size)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border text-sm tabular-nums transition-colors",
                filters.sizes.includes(size)
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-ink-700 text-fg-muted hover:text-fg",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-fg">Màu sắc</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {availableColors.map((color) => {
            const selected = filters.colors.includes(color.hex);
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => toggleColor(color.hex)}
                aria-pressed={selected}
                aria-label={color.name}
                title={color.name}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform",
                  selected ? "scale-110 border-brand" : "border-transparent",
                )}
              >
                <span
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: color.hex }}
                />
                {selected && (
                  <Check
                    className="absolute h-3.5 w-3.5 text-white mix-blend-difference"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-fg-muted">
        <input
          type="checkbox"
          checked={filters.saleOnly}
          onChange={(e) => onChange((f) => ({ ...f, saleOnly: e.target.checked }))}
          className="accent-brand"
        />
        Chỉ hàng đang giảm giá
      </label>
    </div>
  );
}
