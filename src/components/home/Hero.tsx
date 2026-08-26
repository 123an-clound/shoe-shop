"use client";

import Image from "next/image";
import { useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ChevronDown } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GridLines } from "@/components/fx/GridLines";
import { usePointerFine, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

const PARALLAX_RANGE = 20;

export function Hero({
  headline,
  subheadline,
  imageUrl,
  imageAlt,
}: {
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  imageAlt: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 20 });
  const y = useSpring(rawY, { stiffness: 80, damping: 20 });

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    if (!pointerFine || reducedMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawX.set(px * PARALLAX_RANGE * 2);
    rawY.set(py * PARALLAX_RANGE * 2);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <GridLines />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SplitText
            as="h1"
            text={headline}
            className="text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[1.05] text-fg"
          />
          {subheadline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-md text-lg text-fg-muted"
            >
              {subheadline}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton>
              <Button href="/san-pham" size="lg">
                Khám phá bộ sưu tập
              </Button>
            </MagneticButton>
            <Button href="/san-pham?sort=moi-nhat" variant="glass" size="lg">
              Xem sản phẩm mới
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-full max-w-md motion-safe:animate-float"
        >
          <motion.div style={{ x, y }} className="relative h-full w-full">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-full bg-brand opacity-40 blur-[100px]"
            />
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="relative object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center px-8 text-center text-sm text-fg-subtle">
                Ảnh sản phẩm sẽ hiện ở đây sau khi tạo ảnh sản phẩm (Phase 2 —
                npm run gen:images)
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute inset-x-0 bottom-8 flex justify-center"
      >
        <ChevronDown
          className="h-6 w-6 text-fg-subtle motion-safe:animate-bounce"
          aria-hidden="true"
        />
      </motion.div>
    </section>
  );
}
