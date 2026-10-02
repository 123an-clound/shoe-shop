import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { CartPageContent } from "@/components/cart/CartPageContent";
import type { Locale } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> { return { title: (await params).locale === "en" ? "Your bag" : "Giỏ hàng", robots: { index: false, follow: false } }; }

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <CartPageContent
      freeshipThreshold={settings.freeship_threshold}
      couponCode={settings.coupon_code}
      couponPercent={settings.coupon_percent}
    />
  );
}
