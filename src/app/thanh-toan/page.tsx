import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return { title: `Thanh toán — ${settings.store_name}` };
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-10 text-center font-display text-3xl font-bold text-fg sm:text-4xl">
        Thanh toán
      </h1>
      <CheckoutForm />
    </div>
  );
}
