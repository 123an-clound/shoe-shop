"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bọc toàn bộ storefront để cuộn mượt bằng Lenis, đồng bộ với GSAP ticker và
 * ScrollTrigger (dùng ở ScrollStory — Phase 3). Tắt hẳn khi người dùng bật
 * prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<React.ComponentRef<typeof ReactLenis>>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
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
