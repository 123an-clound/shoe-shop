import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { CartPageContent } from "@/components/cart/CartPageContent";
import type { Locale } from "@/lib/i18n/messages";
import { CustomerAccountOrders } from "@/components/customer/CustomerAccountOrders";
import { customerOrderScope } from "@/lib/customer/orders";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> { return { title: (await params).locale === "en" ? "Your bag" : "Giỏ hàng", robots: { index: false, follow: false } }; }

export default async function CartPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ "don-page"?: string; "don-group"?: string; auth?: string }> }) {
  const [settings, { locale }, query] = await Promise.all([getSettings(), params, searchParams]);
  const requestedPage = Number(query["don-page"]);
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 10000 ? requestedPage : 1;

  return (
    <>
      <CartPageContent
        freeshipThreshold={settings.freeship_threshold}
        couponCode={settings.coupon_code}
        couponPercent={settings.coupon_percent}
      />
      <CustomerAccountOrders locale={locale} page={page} scope={customerOrderScope(query["don-group"])} authNotice={query.auth} />
    </>
  );
}
