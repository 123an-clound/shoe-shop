import { Ruler } from "lucide-react";
import type { SizeGuideRow } from "@/lib/sizeGuide";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

/** Bảng quy đổi chiều dài bàn chân → size — lý do trả hàng số một là sai size (Phụ lục A2 PLAN.md). */
export function SizeGuide({ rows }: { rows: SizeGuideRow[] }) {
  const { messages } = useLocaleContext();
  return (
    <details className="group rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded text-fg-muted marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        <Ruler className="h-4 w-4" aria-hidden="true" />
        {messages.product.sizeGuide}
      </summary>
      <table className="mt-4 w-full text-left text-xs">
        <caption className="sr-only">{messages.product.sizeGuide}</caption>
        <thead>
          <tr className="text-fg-muted">
            <th scope="col" className="pb-2 font-normal">{messages.product.size}</th>
            <th scope="col" className="pb-2 font-normal">{messages.product.footLength}</th>
          </tr>
        </thead>
        <tbody className="text-fg">
          {rows.map((row) => (
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
