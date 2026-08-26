import { Ruler } from "lucide-react";

const SIZE_GUIDE: { size: number; cm: number }[] = [
  { size: 39, cm: 24.5 },
  { size: 40, cm: 25.0 },
  { size: 41, cm: 25.5 },
  { size: 42, cm: 26.0 },
  { size: 43, cm: 26.5 },
  { size: 44, cm: 27.0 },
  { size: 45, cm: 27.5 },
];

/** Bảng quy đổi chiều dài bàn chân → size — lý do trả hàng số một là sai size (Phụ lục A2 PLAN.md). */
export function SizeGuide() {
  return (
    <details className="group rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-fg-muted marker:content-none">
        <Ruler className="h-4 w-4" aria-hidden="true" />
        Bảng quy đổi size theo chiều dài bàn chân
      </summary>
      <table className="mt-4 w-full text-left text-xs">
        <thead>
          <tr className="text-fg-subtle">
            <th className="pb-2 font-normal">Size (EU)</th>
            <th className="pb-2 font-normal">Dài bàn chân</th>
          </tr>
        </thead>
        <tbody className="text-fg">
          {SIZE_GUIDE.map((row) => (
            <tr key={row.size} className="border-t border-ink-700">
              <td className="py-2 tabular-nums">{row.size}</td>
              <td className="py-2 tabular-nums">{row.cm.toFixed(1)} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
