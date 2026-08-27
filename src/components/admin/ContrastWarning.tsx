import { AlertTriangle } from "lucide-react";
import { contrastWithBackground, isLowContrast } from "@/lib/contrast";

/** Cảnh báo khi màu vừa chọn có tương phản với nền #07060d dưới 3:1 (mục 2.1 PLAN.md). */
export function ContrastWarning({ hex, label }: { hex: string; label: string }) {
  if (!isLowContrast(hex)) return null;

  const ratio = contrastWithBackground(hex).toFixed(1);

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label} có tương phản thấp với nền tối (tỉ lệ {ratio}:1, nên ≥ 3:1) — chữ đặt lên có
      thể khó đọc.
    </p>
  );
}
