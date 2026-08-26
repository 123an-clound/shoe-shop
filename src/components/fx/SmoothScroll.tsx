"use client";

import gsap from "gsap";
import { ReactLenis } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * Bọc toàn bộ storefront để cuộn mượt bằng Lenis, đồng bộ với GSAP ticker
 * để ScrollTrigger (Phase 3) chạy đúng nhịp. Tắt hẳn khi người dùng bật
 * prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<React.ComponentRef<typeof ReactLenis>>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root ref={lenisRef} options={{ lerp: 0.09, autoRaf: false }}>
      {children}
    </ReactLenis>
  );
}
