"use client";

import { useId } from "react";
import { Input } from "@/components/ui/Input";
import { getInventoryTotal, hasVariantInventory } from "@/lib/productVariants";
import type { ProductColor } from "@/types";

export function ProductInventoryInputs({ colors, sizes, stock, onChange, errors = {}, disabled = false, sizeLabels = {} }: {
  colors: ProductColor[];
  sizes: number[];
  stock: number;
  onChange: (colors: ProductColor[]) => void;
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  sizeLabels?: Record<number, string>;
}) {
  const fieldId = useId();
  const tracked = hasVariantInventory(colors);
  const total = tracked ? getInventoryTotal(colors) : stock;

  return (
    <fieldset disabled={disabled} className="min-w-0 rounded-xl border border-ink-700 p-4">
      <legend className="px-2 text-sm font-semibold text-fg">Tồn kho theo màu & size</legend>
      <p className="text-sm text-fg-muted">Tổng tồn kho: <strong className="tabular-nums text-fg">{total} đôi</strong></p>
      {!colors.length || !sizes.length ? <p className="mt-3 text-sm text-fg-muted">Thêm ít nhất một màu và một size để nhập tồn kho.</p> : !tracked ? (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm text-fg-muted">{stock} đôi chưa phân bổ theo màu và size. Nhập số thực tế cho từng ô; tổng tồn kho sẽ được tính lại từ các ô này.</p>
          <button type="button" disabled={!colors.length || !sizes.length}
            onClick={() => onChange(colors.map((color) => ({ ...color, inventory: sizes.map((size) => ({ size, quantity: 0 })) })))}
            className="min-h-11 self-start rounded-lg border border-brand px-4 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50">
            Phân bổ tồn kho theo biến thể
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-fg-muted">Nhập số đôi thực tế cho từng màu và size. Nhập 0 nếu hết hàng hoặc màu không có size đó.</p>
          {colors.map((color, colorIndex) => (
            <fieldset key={colorIndex} className="min-w-0 rounded-lg border border-ink-700 p-3">
              <legend className="flex flex-wrap items-center gap-2 px-1 text-sm font-medium text-fg">
                <span className="h-4 w-4 rounded-full border border-ink-700" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                {color.name || `Màu ${colorIndex + 1}`}
                <span className="text-fg-muted">({getInventoryTotal([color])} đôi)</span>
              </legend>
              <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 sm:grid-cols-4">
                {sizes.map((size) => {
                  const quantity = color.inventory?.find((entry) => entry.size === size)?.quantity ?? 0;
                  return (
                    <Input key={size} label={`Size ${sizeLabels[size] ?? size}`} aria-label={`Tồn kho ${color.name || `màu ${colorIndex + 1}`} size ${sizeLabels[size] ?? size}`}
                      id={`${fieldId}-inventory-${colorIndex}-${size}`} type="number" min={0} max={2147483647} step={1} inputMode="numeric"
                      value={Number.isNaN(quantity) ? "" : quantity} error={errors[`${colorIndex}.${size}`]}
                      className="min-w-0 w-full text-base tabular-nums sm:text-sm"
                      onChange={(event) => onChange(colors.map((entry, index) => index !== colorIndex ? entry : ({
                        ...entry,
                        inventory: sizes.map((currentSize) => ({ size: currentSize,
                          quantity: currentSize === size ? (event.target.value === "" ? NaN : Number(event.target.value)) : color.inventory?.find((item) => item.size === currentSize)?.quantity ?? 0,
                        })),
                      })))} />
                  );
                })}
              </div>
              {errors[`${colorIndex}`] && <p role="alert" className="mt-2 text-sm text-red-400">{errors[`${colorIndex}`]}</p>}
            </fieldset>
          ))}
        </div>
      )}
    </fieldset>
  );
}
