"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation/order";
import { placeOrder } from "@/lib/actions/orders";
import { useCartStore } from "@/store/cart";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";
import { localizedHref } from "@/lib/i18n/messages";

const STEP_FIELDS: (keyof CheckoutFormValues)[][] = [
  ["customerName", "customerPhone", "customerEmail"],
  ["address", "note"],
  [],
];

export function CheckoutForm() {
  const { locale, messages } = useLocaleContext();
  const copy = messages.checkout;
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const steps = [...copy.steps];

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      address: "",
      note: "",
      couponCode: "",
    },
  });

  const subtotalEstimate = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function goNext(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(steps.length - 1, s + 1));
  }

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) {
      setServerError(copy.errorEmpty);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    const result = await placeOrder({
      ...values,
      items: items.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
    });

    setSubmitting(false);

    if (!result.success) {
      // Lỗi từ RPC đã là tiếng Việt viết sẵn cho người dùng — hiện nguyên văn lên toast (mục 4.8 PLAN.md).
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    clearCart();
    router.push(
      localizedHref(`/thanh-toan/thanh-cong?ma=${encodeURIComponent(result.orderCode)}&tong=${result.orderTotal}`, locale),
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-fg-muted">
        {copy.empty}{" "}
        <LocaleLink href="/san-pham" className="text-brand hover:underline">{messages.cart.continue}</LocaleLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-xl">
      <CheckoutSteps steps={steps} current={step} />

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Input
            label={copy.name}
            error={errors.customerName?.message}
            {...register("customerName")}
          />
          <Input
            label={copy.phone}
            error={errors.customerPhone?.message}
            {...register("customerPhone")}
          />
          <Input
            label={copy.email}
            type="email"
            error={errors.customerEmail?.message}
            {...register("customerEmail")}
          />
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Input
            label={copy.address}
            error={errors.address?.message}
            {...register("address")}
          />
          <Input
            label={copy.note}
            error={errors.note?.message}
            {...register("note")}
          />
          <Input
            label={copy.coupon}
            error={errors.couponCode?.message}
            {...register("couponCode")}
          />
        </div>
      )}

      {step === 2 && (
        <CheckoutSummary items={items} subtotal={subtotalEstimate} error={serverError} />
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            {copy.back}
          </Button>
        ) : (
          <span />
        )}

        {step < steps.length - 1 ? (
          <Button type="button" onClick={goNext}>
            {copy.next}
          </Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting ? copy.submitting : copy.placeOrder}
          </Button>
        )}
      </div>
    </form>
  );
}
