"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const newsletterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function Newsletter() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(values: NewsletterValues) {
    // Demo: chưa có bảng lưu người đăng ký, chỉ mô phỏng gửi thành công.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success(`Đã đăng ký nhận tin với ${values.email}`);
    reset();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="glass glow-border rounded-[var(--radius-card)] p-8 sm:p-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">
              Nhận tin khuyến mãi sớm nhất
            </h2>
            <p className="mt-2 text-fg-muted">
              Ưu đãi mới, hàng về sớm và mã giảm giá riêng — gửi thẳng vào email
              của bạn.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-6 flex flex-col items-start gap-3 sm:flex-row"
            >
              <div className="w-full flex-1">
                <Input
                  type="email"
                  placeholder="email@cua-ban.com"
                  aria-label="Địa chỉ email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
