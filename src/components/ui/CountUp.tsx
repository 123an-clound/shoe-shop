"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/** Đếm tăng dần khi vào viewport — dùng cho section Thống kê (mục 5.1/6 PLAN.md). */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = usePrefersReducedMotion();
  const count = useMotionValue(0);
  const display = useTransform(count, (value) =>
    value.toLocaleString("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    if (!isInView) return;

    if (reducedMotion) {
      count.set(to);
      return;
    }

    const controls = animate(count, to, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [isInView, reducedMotion, to, duration, count]);

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
