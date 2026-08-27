import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = { title: "Giỏ hàng" };

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
