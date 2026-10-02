import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GridLines } from "@/components/fx/GridLines";
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
    <section
      className="relative flex min-h-[82svh] items-center overflow-hidden lg:min-h-[88svh]"
    >
      <GridLines />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h1 className="text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[1.05] text-fg">
            {headline}
          </h1>
          {subheadline && (
            <p className="mt-6 max-w-md text-lg text-fg-muted">
              {subheadline}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/san-pham" size="lg">{primaryLabel || copy.heroCta}</Button>
            <Button href="/san-pham?sort=moi-nhat" variant="glass" size="lg">
              {secondaryLabel || copy.heroSecondary}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[11rem] sm:max-w-xs lg:max-w-md lg:motion-safe:animate-float">
          <div className="relative h-full w-full">
            <div
              aria-hidden="true"
              className="absolute inset-8 rounded-full bg-brand opacity-40 blur-[56px] lg:blur-[100px]"
            />
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 40vw, 80vw"
                className="relative object-contain drop-shadow-lg lg:drop-shadow-2xl"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center px-8 text-center text-sm text-fg-subtle">
                Ảnh sản phẩm sẽ hiện ở đây sau khi tạo ảnh sản phẩm (Phase 2 —
                npm run gen:images)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <ChevronDown
          className="h-6 w-6 text-fg-subtle motion-safe:animate-bounce"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
