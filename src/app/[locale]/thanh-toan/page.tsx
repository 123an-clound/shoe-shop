import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: "vi" | "en" }> }): Promise<Metadata> { return { title: (await params).locale === "en" ? "Checkout" : "Thanh toán", robots: { index: false, follow: false } }; }

export default async function CheckoutPage({ params }: { params: Promise<{ locale: "vi" | "en" }> }) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-10 text-center font-display text-3xl font-bold text-fg sm:text-4xl">
        {locale === "en" ? "Checkout" : "Thanh toán"}
      </h1>
      <CheckoutForm />
    </div>
  );
}
