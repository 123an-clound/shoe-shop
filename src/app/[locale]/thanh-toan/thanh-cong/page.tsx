import { Confetti } from "@/components/checkout/Confetti";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/format";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) { return { title: (await params).locale === "en" ? "Order placed" : "Đặt hàng thành công", robots: { index: false, follow: false } }; }

export default async function CheckoutSuccessPage({ searchParams, params }: { searchParams: Promise<{ ma?: string | string[]; tong?: string | string[] }>; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = getMessages(locale).success;
  const query = await searchParams;
  const orderCode = typeof query.ma === "string" ? query.ma : null;
  const orderTotal = typeof query.tong === "string" ? Number(query.tong) : null;

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <Confetti />

      <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
        {copy.title}
      </h1>

      {orderCode ? (
        <>
          <p className="text-fg-muted">
            {copy.code}: <span className="font-medium text-brand">{orderCode}</span>
          </p>
          {orderTotal !== null && !Number.isNaN(orderTotal) && (
            <p className="tabular-nums text-fg-muted">
              {copy.total}: <span className="font-medium text-fg">{formatVND(orderTotal)}</span>
            </p>
          )}
        </>
      ) : (
        <p className="text-fg-muted">{copy.body}</p>
      )}

      <p className="text-sm text-fg-subtle">
        {copy.body}
      </p>

      <Button href="/san-pham" className="mt-4">
        {copy.continue}
      </Button>
    </div>
  );
}
