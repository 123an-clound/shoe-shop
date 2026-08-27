import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/queries/settings";
import { PageTransition } from "@/components/fx/PageTransition";
import { CustomCursor } from "@/components/fx/CustomCursor";
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
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: settings.store_name, template: `%s — ${settings.store_name}` },
    description: settings.slogan,
  };
}

/**
 * Layout gốc — chỉ những gì thật sự chung cho cả storefront lẫn /admin
 * (font, nền tối, màu thương hiệu, toast). Header/Footer/hiệu ứng nặng nằm ở
 * app/(storefront)/layout.tsx — /admin có layout riêng, không dùng chung.
 */
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
        {children}
        <CustomCursor />
        <PageTransition />
        <Toaster theme="dark" richColors position="bottom-right" />
      </body>
    </html>
  );
}
