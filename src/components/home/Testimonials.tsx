"use client";

import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/cn";
import type { Testimonial } from "@/lib/queries/testimonials";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function Testimonials({ testimonials, locale = "vi" }: { testimonials: Testimonial[]; locale?: Locale }) {
  const title = getMessages(locale).home.testimonials;
  const reducedMotion = usePrefersReducedMotion();
  const [plugins] = useState(() =>
    reducedMotion
      ? []
      : [Autoplay({ delay: 5000, stopOnMouseEnter: true, stopOnInteraction: false })],
  );
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" }, plugins);

  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          {title}
        </h2>
      </Reveal>

      <div className="mt-10 overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="min-w-0 shrink-0 grow-0 basis-full px-2 sm:basis-1/2 lg:basis-1/3"
            >
              <div className="glass flex h-full flex-col gap-4 rounded-[var(--radius-card)] p-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < testimonial.rating
                          ? "fill-neon-lime text-neon-lime"
                          : "text-ink-700",
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="flex-1 text-sm text-fg-muted">
                  &ldquo;{locale === "en" ? testimonial.content_en || testimonial.content : testimonial.content}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-aurora)] text-sm font-medium text-on-brand"
                    aria-hidden="true"
                  >
                    {initials(testimonial.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-fg">{testimonial.name}</p>
                    {(locale === "en" ? testimonial.role_en || testimonial.role : testimonial.role) && (
                      <p className="text-xs text-fg-subtle">{locale === "en" ? testimonial.role_en || testimonial.role : testimonial.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
