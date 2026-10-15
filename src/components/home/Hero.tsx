import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";

export function Hero({
  locale,
  headline,
  subheadline,
  imageUrl,
  imageAlt,
  primaryLabel,
  secondaryLabel,
}: {
  locale: Locale;
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  imageAlt: string;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
}) {
  const copy = getMessages(locale).home;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="relative isolate flex min-h-[max(36rem,76svh)] items-center overflow-hidden rounded-[var(--radius-card)] bg-black lg:min-h-[82svh]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            sizes="(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
            className="object-cover object-center"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/65 lg:bg-transparent lg:bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.65)_60%,rgba(0,0,0,0.2)_100%)]"
        />

        <div className="relative z-10 w-full px-6 py-24 sm:px-10 lg:px-14 lg:py-28">
          <h1 className="max-w-3xl text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[1.05] text-white">
            {headline}
          </h1>
          {subheadline && (
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/90">
              {subheadline}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
            <Button href="/san-pham" size="lg" className="w-full max-w-full px-5 text-center sm:w-auto">{primaryLabel || copy.heroCta}</Button>
            <Button href="/san-pham?sort=moi-nhat" variant="glass" size="lg" className="w-full max-w-full border-white/40 bg-black/30 px-5 text-center text-white hover:bg-black/50 focus-visible:ring-white focus-visible:ring-offset-black sm:w-auto">
              {secondaryLabel || copy.heroSecondary}
            </Button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <ChevronDown
            className="h-6 w-6 text-white/80 motion-safe:animate-bounce"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
