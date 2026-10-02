"use client";

import { useForm, useWatch } from "react-hook-form";
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
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      storeName: settings.store_name,
      slogan: settings.slogan,
      sloganEn: settings.slogan_en ?? "",
      heroHeadline: settings.hero_headline ?? "",
      heroSubheadline: settings.hero_subheadline ?? "",
      heroHeadlineEn: settings.hero_headline_en ?? "",
      heroSubheadlineEn: settings.hero_subheadline_en ?? "",
      heroCtaLabelVi: settings.hero_cta_label_vi ?? "",
      heroCtaLabelEn: settings.hero_cta_label_en ?? "",
      announcementEnabled: settings.announcement_enabled,
      announcementTextVi: settings.announcement_text_vi ?? "",
      announcementTextEn: settings.announcement_text_en ?? "",
      homepageSections: Array.isArray(settings.homepage_sections) ? settings.homepage_sections.filter((item): item is string => typeof item === "string") : ["hero", "marquee", "categories", "featured", "story", "stats", "testimonials", "newsletter"],
      seoTitleVi: settings.seo_title_vi ?? "",
      seoTitleEn: settings.seo_title_en ?? "",
      seoDescriptionVi: settings.seo_description_vi ?? "",
      seoDescriptionEn: settings.seo_description_en ?? "",
      ogImageUrl: settings.og_image_url ?? "",
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

  const colorPrimary = useWatch({ control, name: "colorPrimary" });
  const colorSecondary = useWatch({ control, name: "colorSecondary" });
  const colorAccent = useWatch({ control, name: "colorAccent" });
  const logoUrl = useWatch({ control, name: "logoUrl" });
  const heroImageUrl = useWatch({ control, name: "heroImageUrl" });
  const homepageSections = useWatch({ control, name: "homepageSections" });
  const sectionOptions = [["hero", "Hero"], ["marquee", "Dải danh mục"], ["categories", "Danh mục"], ["featured", "Sản phẩm nổi bật"], ["story", "Câu chuyện thương hiệu"], ["stats", "Thống kê"], ["testimonials", "Đánh giá khách hàng"], ["newsletter", "Đăng ký nhận tin"]] as const;

  async function onSubmit(values: SettingsFormValues) {
    let result;
    try {
      result = await updateSettings(values, settings.updated_at);
    } catch {
      toast.error("Không kết nối được để lưu cài đặt. Dữ liệu trên form vẫn được giữ lại.");
      return;
    }
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
        <Input label="Slogan tiếng Anh" {...register("sloganEn")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Tiêu đề Hero" {...register("heroHeadline")} />
          <Input label="Mô tả phụ Hero" {...register("heroSubheadline")} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Hero headline (English)" {...register("heroHeadlineEn")} />
          <Input label="Hero description (English)" {...register("heroSubheadlineEn")} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nhãn nút Hero (VI)" {...register("heroCtaLabelVi")} />
          <Input label="Hero button label (EN)" {...register("heroCtaLabelEn")} />
        </div>
        <label className="flex items-center gap-3 text-sm text-fg"><input type="checkbox" className="accent-brand" {...register("announcementEnabled")} /> Hiện thông báo đầu trang</label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Thông báo (VI)" {...register("announcementTextVi")} />
          <Input label="Announcement (EN)" {...register("announcementTextEn")} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BrandingImageField
            label="Logo"
            path="branding/logo"
            value={logoUrl ?? ""}
            onChange={(url) => setValue("logoUrl", url)}
          />
          <BrandingImageField
            label="Ảnh Hero"
            path="branding/hero"
            value={heroImageUrl ?? ""}
            onChange={(url) => setValue("heroImageUrl", url)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-fg">Nội dung trang chủ</h2>
        <p className="text-sm text-fg-muted">Chọn các khối cần hiển thị. Thứ tự hiện theo danh sách cấu hình.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[...homepageSections, ...sectionOptions.map(([key]) => key).filter((key) => !homepageSections.includes(key))].map((key, index, ordered) => {
            const label = sectionOptions.find(([option]) => option === key)?.[1] ?? key;
            const enabled = homepageSections.includes(key);
            return <div key={key} className="flex items-center gap-2 rounded-lg border border-ink-700 p-3 text-sm">
              <input aria-label={`Hiện ${label}`} type="checkbox" checked={enabled} onChange={(event) => setValue("homepageSections", event.target.checked ? [...homepageSections, key] : homepageSections.filter((item) => item !== key), { shouldDirty: true })} className="accent-brand" />
              <span className="flex-1">{label}</span>
              <button type="button" aria-label={`Chuyển ${label} lên`} disabled={index === 0} onClick={() => { const next = [...ordered]; [next[index - 1], next[index]] = [next[index]!, next[index - 1]!]; setValue("homepageSections", next.filter((item) => homepageSections.includes(item)), { shouldDirty: true }); }} className="h-8 w-8 rounded border border-ink-700 disabled:opacity-30">↑</button>
              <button type="button" aria-label={`Chuyển ${label} xuống`} disabled={index === ordered.length - 1} onClick={() => { const next = [...ordered]; [next[index + 1], next[index]] = [next[index]!, next[index + 1]!]; setValue("homepageSections", next.filter((item) => homepageSections.includes(item)), { shouldDirty: true }); }} className="h-8 w-8 rounded border border-ink-700 disabled:opacity-30">↓</button>
            </div>;
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold text-fg">SEO &amp; chia sẻ</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Tiêu đề SEO (VI)" {...register("seoTitleVi")} /><Input label="SEO title (EN)" {...register("seoTitleEn")} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Mô tả SEO (VI)" {...register("seoDescriptionVi")} /><Input label="SEO description (EN)" {...register("seoDescriptionEn")} /></div>
        <Input label="Ảnh chia sẻ (URL)" {...register("ogImageUrl")} />
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
