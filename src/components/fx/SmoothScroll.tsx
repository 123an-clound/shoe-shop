import type { ReactNode } from "react";

/** Keep native scrolling on the storefront for lower input latency and less JS. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return children;
}
