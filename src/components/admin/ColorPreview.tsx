import type { CSSProperties } from "react";

/**
 * Xem trước tức thì bộ màu đang chọn — chưa cần lưu (mục 0.1 PLAN.md: "đây là
 * màn demo, không được reload mới thấy"). Biến CSS chỉ áp trong phạm vi khối
 * này, không đụng tới :root của toàn trang.
 */
export function ColorPreview({
  primary,
  secondary,
  accent,
}: {
  primary: string;
  secondary: string;
  accent: string;
}) {
  const style = {
    "--brand-primary": primary,
    "--brand-secondary": secondary,
    "--brand-accent": accent,
  } as CSSProperties;

  return (
    <div
      style={style}
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-ink-700 bg-ink-950 p-6"
    >
      <p className="text-xs uppercase tracking-wide text-fg-subtle">Xem trước</p>
      <div
        className="rounded-[var(--radius-card)] p-6"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 45%, var(--brand-accent) 100%)",
        }}
      >
        <p className="font-display text-lg font-bold text-ink-950">Giày nam. Không thỏa hiệp.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-950"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 45%, var(--brand-accent) 100%)",
          }}
        >
          Khám phá bộ sưu tập
        </button>
        <span
          className="rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            color: "var(--brand-primary)",
            backgroundColor: "color-mix(in oklab, var(--brand-primary) 18%, transparent)",
          }}
        >
          Badge mẫu
        </span>
      </div>
    </div>
  );
}
