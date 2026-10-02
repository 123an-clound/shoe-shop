import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/queries/settings";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seo_title_vi;
  const description = settings.seo_description_vi;
  return {
    metadataBase: SITE_URL,
    title: { default: title || settings.store_name, template: `%s — ${settings.store_name}` },
    description: description || settings.slogan,
    openGraph: {
      title: title || settings.store_name,
      description: description || settings.slogan,
      images: [settings.og_image_url || settings.hero_image_url].filter((image): image is string => Boolean(image)),
      locale: "vi_VN",
      type: "website",
    },
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
      data-theme="dark"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        {/* Tầng màu thương hiệu — đọc từ veloce_settings, ghi đè giá trị dự phòng trong globals.css */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--brand-primary:${settings.color_primary};--brand-secondary:${settings.color_secondary};--brand-accent:${settings.color_accent};}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("veloce-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}`,
          }}
        />
      </head>
      <body className="min-h-full bg-ink-950 text-fg">
        {children}
        <Toaster theme="system" richColors position="bottom-right" />
      </body>
    </html>
  );
}
