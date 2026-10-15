"use client";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const node = event.currentTarget, x = event.clientX, y = event.clientY;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--tilt-x", `${(0.5 - (y - rect.top) / rect.height) * 8}deg`);
      node.style.setProperty("--tilt-y", `${((x - rect.left) / rect.width - 0.5) * 8}deg`);
    });
  }
  return <div onPointerMove={move} onPointerLeave={(event) => {
    cancelAnimationFrame(frame.current);
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  }} className={cn("tilt-card relative", className)}>{children}</div>;
}
