"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ColorPickerField } from "@/components/admin/ColorPickerField";
import { ColorPresetButtons } from "@/components/admin/ColorPresetButtons";
import { ColorPreview } from "@/components/admin/ColorPreview";
import { BrandingImageField } from "@/components/admin/BrandingImageField";
import { updateSettings } from "@/lib/actions/settings";
import { settingsFormSchema, type SettingsFormValues } from "@/lib/validation/settings";
import type { Settings } from "@/lib/queries/settings";

export function SettingsForm({ settings }: { settings: Settings }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      storeName: settings.store_name,
      slogan: settings.slogan,
      heroHeadline: settings.hero_headline ?? "",
      heroSubheadline: settings.hero_subheadline ?? "",
      logoUrl: settings.logo_url ?? "",
      heroImageUrl: settings.hero_image_url ?? "",
      colorPrimary: settings.color_primary,
      colorSecondary: settings.color_secondary,
      colorAccent: settings.color_accent,
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      address: settings.address ?? "",
      facebookUrl: settings.facebook_url ?? "",
      instagramUrl: settings.instagram_url ?? "",
      zaloUrl: settings.zalo_url ?? "",
      couponCode: settings.coupon_code ?? "",
      couponPercent: settings.coupon_percent,
      freeshipThreshold: settings.freeship_threshold,
      shippingFee: settings.shipping_fee,
    },
  });

  const colorPrimary = watch("colorPrimary");
  const colorSecondary = watch("colorSecondary");
  const colorAccent = watch("colorAccent");
  const logoUrl = watch("logoUrl");
  const heroImageUrl = watch("heroImageUrl");

  async function onSubmit(values: SettingsFormValues) {
    const result = await updateSettings(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã lưu cài đặt — trang ngoài sẽ cập nhật ngay.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-3xl flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-fg">Thông tin cửa hàng</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Tên cửa hàng" error={errors.storeName?.message} {...register("storeName")} />
          <Input label="Khẩu hiệu" error={errors.slogan?.message} {...register("slogan")} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Tiêu đề Hero" {...register("heroHeadline")} />
          <Input label="Mô tả phụ Hero" {...register("heroSubheadline")} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BrandingImageField
            label="Logo"
            path="branding/logo.png"
            value={logoUrl ?? ""}
            onChange={(url) => setValue("logoUrl", url)}
          />
          <BrandingImageField
            label="Ảnh Hero"
            path="branding/hero.jpg"
            value={heroImageUrl ?? ""}
            onChange={(url) => setValue("heroImageUrl", url)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-fg">Màu thương hiệu</h2>
        <ColorPresetButtons
          onSelect={(preset) => {
            setValue("colorPrimary", preset.primary);
            setValue("colorSecondary", preset.secondary);
            setValue("colorAccent", preset.accent);
          }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorPickerField
            label="Màu chính"
            value={colorPrimary}
            onChange={(hex) => setValue("colorPrimary", hex)}
          />
          <ColorPickerField
            label="Màu phụ"
            value={colorSecondary}
            onChange={(hex) => setValue("colorSecondary", hex)}
          />
          <ColorPickerField
            label="Màu nhấn"
            value={colorAccent}
            onChange={(hex) => setValue("colorAccent", hex)}
          />
        </div>
        <ColorPreview primary={colorPrimary} secondary={colorSecondary} accent={colorAccent} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-fg">Liên hệ</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Số điện thoại" {...register("phone")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        </div>
        <Input label="Địa chỉ" {...register("address")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Facebook" error={errors.facebookUrl?.message} {...register("facebookUrl")} />
          <Input label="Instagram" error={errors.instagramUrl?.message} {...register("instagramUrl")} />
          <Input label="Zalo" error={errors.zaloUrl?.message} {...register("zaloUrl")} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-fg">Bán hàng</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Mã giảm giá" {...register("couponCode")} />
          <Input
            label="% giảm giá"
            type="number"
            error={errors.couponPercent?.message}
            {...register("couponPercent", { valueAsNumber: true })}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Ngưỡng freeship (₫)"
            type="number"
            error={errors.freeshipThreshold?.message}
            {...register("freeshipThreshold", { valueAsNumber: true })}
          />
          <Input
            label="Phí vận chuyển (₫)"
            type="number"
            error={errors.shippingFee?.message}
            {...register("shippingFee", { valueAsNumber: true })}
          />
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting} className="self-start" size="lg">
        {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
      </Button>
    </form>
  );
}
