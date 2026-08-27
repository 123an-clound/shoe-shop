"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { usePointerFine, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/**
 * Vòng tròn theo chuột, phóng to khi hover link — chỉ bật trên desktop storefront
 * (mục 6 PLAN.md). Không hiện ở /admin — khu quản trị ưu tiên rõ ràng, không hiệu ứng.
 */
export function CustomCursor() {
  const pathname = usePathname();
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40 });
  const springY = useSpring(y, { stiffness: 500, damping: 40 });

  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const active = pointerFine && !reducedMotion && !isAdmin;

  useEffect(() => {
    document.body.classList.toggle("cursor-hidden", active);
    return () => {
      document.body.classList.remove("cursor-hidden");
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }

    function handleOver(e: MouseEvent) {
      const target = e.target instanceof HTMLElement ? e.target.closest("a, button") : null;
      setHovering(!!target);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
    };
  }, [active, x, y]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden="true"
      animate={{ scale: hovering ? 3 : 1 }}
      transition={{ scale: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      className="pointer-events-none fixed left-0 top-0 z-[200] h-4 w-4 rounded-full bg-fg mix-blend-difference"
    />
  );
}
