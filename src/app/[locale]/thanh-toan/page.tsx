import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutAccount } from "@/components/customer/CheckoutAccount";
import { getCustomerSession } from "@/lib/customer/session";

export async function generateMetadata({ params }: { params: Promise<{ locale: "vi" | "en" }> }): Promise<Metadata> { return { title: (await params).locale === "en" ? "Checkout" : "Thanh toán", robots: { index: false, follow: false } }; }

export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ locale: "vi" | "en" }>; searchParams: Promise<{ auth?: string }> }) {
  const [{ locale }, query, session] = await Promise.all([params, searchParams, getCustomerSession()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-10 text-center font-display text-3xl font-bold text-fg sm:text-4xl">
        {locale === "en" ? "Checkout" : "Thanh toán"}
      </h1>
      <CheckoutAccount locale={locale} authNotice={query.auth} />
      <CheckoutForm customerUserId={session.user?.id ?? null} sessionUnavailable={session.error} />
    </div>
  );
}
