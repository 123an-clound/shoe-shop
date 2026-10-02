import type { ReactNode } from "react";
import { getSettings } from "@/lib/queries/settings";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { NoiseOverlay } from "@/components/fx/NoiseOverlay";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getMessages, type Locale } from "@/lib/i18n/messages";
import { PageTransition } from "@/components/fx/PageTransition";
import { notFound } from "next/navigation";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (rawLocale !== "vi" && rawLocale !== "en") notFound();
  const locale = rawLocale as Locale;
  const messages = getMessages(locale);
  const settings = await getSettings();

  return (
    <LocaleProvider locale={locale} messages={messages}>
    <SmoothScroll>
      <div lang={locale}>
      <NoiseOverlay />
      <AuroraBackground />
      {settings.announcement_enabled && (locale === "en" ? settings.announcement_text_en : settings.announcement_text_vi) && <div className="bg-brand px-4 py-2 text-center text-xs font-medium text-on-brand">{locale === "en" ? settings.announcement_text_en : settings.announcement_text_vi}</div>}
      <Header storeName={settings.store_name} />
      <PageTransition />
      <main className="pt-16">{children}</main>
      <Footer settings={settings} locale={locale} />
      <CartDrawer freeshipThreshold={settings.freeship_threshold} />
      </div>
    </SmoothScroll>
    </LocaleProvider>
  );
}
