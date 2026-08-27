import type { ReactNode } from "react";
import { getSettings } from "@/lib/queries/settings";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { NoiseOverlay } from "@/components/fx/NoiseOverlay";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSettings();

  return (
    <SmoothScroll>
      <NoiseOverlay />
      <AuroraBackground />
      <Header storeName={settings.store_name} />
      <main className="pt-16">{children}</main>
      <Footer settings={settings} />
      <CartDrawer freeshipThreshold={settings.freeship_threshold} />
    </SmoothScroll>
  );
}
