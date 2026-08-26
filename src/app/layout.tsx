import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/queries/settings";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { NoiseOverlay } from "@/components/fx/NoiseOverlay";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.store_name,
    description: settings.slogan,
  };
}

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html
      lang="vi"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Tầng màu thương hiệu — đọc từ veloce_settings, ghi đè giá trị dự phòng trong globals.css */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--brand-primary:${settings.color_primary};--brand-secondary:${settings.color_secondary};--brand-accent:${settings.color_accent};}`,
          }}
        />
      </head>
      <body className="min-h-full">
        <SmoothScroll>
          <NoiseOverlay />
          <AuroraBackground />
          <Header storeName={settings.store_name} />
          <main className="pt-16">{children}</main>
          <Footer settings={settings} />
        </SmoothScroll>
        <Toaster theme="dark" richColors position="bottom-right" />
      </body>
    </html>
  );
}
