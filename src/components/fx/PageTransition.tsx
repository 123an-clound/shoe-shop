"use client";

import { useAnimate } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * Overlay gradient quét ngang khi đổi route (mục 6 PLAN.md). Dùng animate mệnh
 * lệnh trên một node cố định — không dùng AnimatePresence theo key pathname vì
 * xung đột với React khi unmount cây trang cũ (removeChild lỗi khi điều hướng).
 * Không áp dụng cho /admin — khu quản trị ưu tiên nhanh, không page transition.
 */
export function PageTransition() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (reducedMotion || pathname?.startsWith("/admin")) return;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    animate(scope.current, { scaleX: [1, 0] }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
  }, [pathname, reducedMotion, animate, scope]);

  if (reducedMotion) return null;

  return (
    <div
      ref={scope}
      aria-hidden="true"
      style={{ transformOrigin: "right", transform: "scaleX(0)" }}
      className="pointer-events-none fixed inset-0 z-[100] bg-[image:var(--gradient-aurora)]"
    />
  );
}
