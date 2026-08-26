"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { usePointerFine } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

const MAX_TILT = 10;

/** Nghiêng 3D ±10° theo chuột + glare chạy theo con trỏ — chỉ bật trên desktop (mục 6 PLAN.md). */
export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerFine = usePointerFine();

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 200, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 200, damping: 20 });

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareBackground = useTransform(
    () =>
      `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.25), transparent 60%)`,
  );

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!pointerFine || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawRotateY.set((px - 0.5) * MAX_TILT * 2);
    rawRotateX.set((0.5 - py) * MAX_TILT * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }

  function handleMouseLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn("relative", className)}
    >
      {children}
      {pointerFine && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBackground }}
        />
      )}
    </motion.div>
  );
}
