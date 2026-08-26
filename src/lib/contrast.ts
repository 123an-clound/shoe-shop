/** Tính độ tương phản WCAG giữa hai màu — dùng để cảnh báo khi admin chọn màu thương hiệu quá tối/quá sáng so với nền. */

const INK_950 = "#07060d";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** Tỉ lệ tương phản WCAG giữa hai màu hex (1:1 → 21:1) */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

/** Tương phản của một màu thương hiệu so với nền trang mặc định `--color-ink-950` */
export function contrastWithBackground(hex: string): number {
  return contrastRatio(hex, INK_950);
}

/** Ngưỡng cảnh báo cho `/admin/cai-dat` theo mục 2.1 PLAN.md */
export function isLowContrast(hex: string): boolean {
  return contrastWithBackground(hex) < 3;
}
