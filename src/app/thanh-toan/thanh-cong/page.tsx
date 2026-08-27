import { Confetti } from "@/components/checkout/Confetti";
import { Button } from "@/components/ui/Button";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Đặt hàng thành công" };

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/thanh-toan/thanh-cong">) {
  const params = await searchParams;
  const orderCode = typeof params.ma === "string" ? params.ma : null;
  const orderTotal = typeof params.tong === "string" ? Number(params.tong) : null;

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <Confetti />

      <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
        Đặt hàng thành công!
      </h1>

      {orderCode ? (
        <>
          <p className="text-fg-muted">
            Mã đơn hàng của bạn là <span className="font-medium text-brand">{orderCode}</span>
          </p>
          {orderTotal !== null && !Number.isNaN(orderTotal) && (
            <p className="tabular-nums text-fg-muted">
              Tổng thanh toán: <span className="font-medium text-fg">{formatVND(orderTotal)}</span>
            </p>
          )}
        </>
      ) : (
        <p className="text-fg-muted">Cảm ơn bạn đã đặt hàng.</p>
      )}

      <p className="text-sm text-fg-subtle">
        Đây là đơn hàng demo, chưa có thanh toán thật. Chúng tôi sẽ liên hệ xác nhận đơn qua số
        điện thoại bạn đã cung cấp.
      </p>

      <Button href="/san-pham" className="mt-4">
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}
