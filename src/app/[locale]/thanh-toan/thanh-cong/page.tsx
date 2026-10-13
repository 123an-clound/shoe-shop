import { Confetti } from "@/components/checkout/Confetti";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/format";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";
import { getRecentOrder } from "@/lib/customer/history";
import { customerCopy } from "@/lib/customer/copy";
import { CustomerOrderCard } from "@/components/customer/CustomerOrderCard";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) { return { title: (await params).locale === "en" ? "Order placed" : "Đặt hàng thành công", robots: { index: false, follow: false } }; }

export default async function CheckoutSuccessPage({ searchParams, params }: { searchParams: Promise<{ ma?: string | string[]; tong?: string | string[] }>; params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = getMessages(locale).success;
  const query = await searchParams;
  const orderCode = typeof query.ma === "string" ? query.ma : null;
  const order = await getRecentOrder(orderCode);

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      {order && <Confetti />}

      <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
        {order ? copy.title : customerCopy(locale).link}
      </h1>

      {order ? (
        <>
          <p className="text-fg-muted">
            {copy.code}: <span className="font-medium text-brand">{order.code}</span>
          </p>
          <p className="tabular-nums text-fg-muted">
            {copy.total}: <span className="font-medium text-fg">{formatVND(order.total)}</span>
          </p>
        </>
      ) : (
        <p className="text-fg-muted">{customerCopy(locale).receiptMissing}</p>
      )}

      {order && <p className="text-sm text-fg-subtle">
        {copy.body}
      </p>}

      {order && <div className="w-full text-left"><CustomerOrderCard order={order} locale={locale} headingLevel={2} /></div>}
      <Button href="/gio-hang#don-hang" className="mt-4">{customerCopy(locale).link}</Button>

      <Button href="/san-pham" variant="glass">
        {copy.continue}
      </Button>
    </div>
  );
}
