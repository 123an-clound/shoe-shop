"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

type Milestone = { year: string; title: string; body: string };

/** Timeline dọc, vạch tiến trình chạy theo tiến độ cuộn bằng GSAP ScrollTrigger (mục 5.6 PLAN.md). */
export function AboutTimeline({ milestones }: { milestones: Milestone[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.5,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-2xl">
      <div className="absolute left-4 top-0 h-full w-px bg-ink-700 sm:left-1/2" aria-hidden="true">
        <div
          ref={lineRef}
          className="h-full w-px origin-top bg-brand"
          style={{ transform: "scaleY(0)" }}
        />
      </div>

      <div className="flex flex-col gap-16">
        {milestones.map((milestone, index) => (
          <Reveal
            key={milestone.year}
            delay={0.05}
            className={
              index % 2 === 0
                ? "relative pl-12 sm:ml-0 sm:mr-auto sm:w-1/2 sm:pr-12 sm:pl-0 sm:text-right"
                : "relative pl-12 sm:ml-auto sm:w-1/2 sm:pl-12"
            }
          >
            <span className="font-display text-sm font-medium text-brand">
              {milestone.year}
            </span>
            <h3 className="mt-1 font-display text-xl font-bold text-fg">{milestone.title}</h3>
            <p className="mt-2 text-fg-muted">{milestone.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
