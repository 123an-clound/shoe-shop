/** Lưới mảnh 1px, fade dần về đáy — một trong ba lớp nền bắt buộc của Hero (mục 2.4 PLAN.md). */
export function GridLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "linear-gradient(to bottom, black, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
      }}
    />
  );
}
