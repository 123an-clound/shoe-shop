import type { SizeGuideRow } from "./sizeGuide";

export function getSizeLabel(value: unknown, size: number): string {
  if (!Array.isArray(value)) return String(size);
  const row = value.find((entry) => entry && typeof entry === "object" && entry.size === size && typeof entry.label === "string" && entry.label.trim().length > 0 && entry.label.length <= 120);
  return row?.label.trim() ?? String(size);
}

export function formatFootLength(row: SizeGuideRow): string {
  if (row.cm === undefined) return "—";
  return `${row.cm.toFixed(1)}${row.cmMax !== undefined && row.cmMax !== row.cm ? `–${row.cmMax.toFixed(1)}` : ""} cm`;
}
