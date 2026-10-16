import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Mã màu không hợp lệ");
const optionalUrl = z.union([z.string().max(2048).url("Đường dẫn không hợp lệ"), z.literal("")]);

export const settingsFormSchema = z.object({
  storeName: z.string().max(200, "Tối đa 200 ký tự").min(1, "Nhập tên cửa hàng"),
  slogan: z.string().min(1, "Nhập khẩu hiệu"),
  sloganEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroHeadline: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroSubheadline: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroHeadlineEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroSubheadlineEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroCtaLabelVi: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroCtaLabelEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  announcementEnabled: z.boolean(),
  announcementTextVi: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  announcementTextEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  homepageSections: z.array(z.string()).max(8),
  seoTitleVi: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  seoTitleEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  seoDescriptionVi: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  seoDescriptionEn: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  ogImageUrl: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  logoUrl: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  heroImageUrl: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  colorPrimary: hexColor,
  colorSecondary: hexColor,
  colorAccent: hexColor,
  phone: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  email: z.union([z.string().email("Email không hợp lệ"), z.literal("")]).optional(),
  address: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  facebookUrl: optionalUrl.optional(),
  instagramUrl: optionalUrl.optional(),
  zaloUrl: optionalUrl.optional(),
  couponCode: z.string().max(2000, "Tối đa 2.000 ký tự").optional(),
  couponPercent: z.number().int().min(0).max(100),
  freeshipThreshold: z.number().int().min(0),
  shippingFee: z.number().int().min(0),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export type ColorPreset = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
};

/** 5 bộ màu dựng sẵn, bấm một phát đổi cả site — mục 0.1/5.7 PLAN.md. */
export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Tím – Cyan", primary: "#8b5cf6", secondary: "#d946ef", accent: "#22d3ee" },
  { name: "Cam – Hồng", primary: "#fb923c", secondary: "#f43f5e", accent: "#fbbf24" },
  { name: "Xanh lá – Vàng chanh", primary: "#16a34a", secondary: "#65a30d", accent: "#facc15" },
  { name: "Xanh dương – Bạc", primary: "#3b82f6", secondary: "#64748b", accent: "#38bdf8" },
  { name: "Đỏ – Vàng đồng", primary: "#dc2626", secondary: "#b45309", accent: "#f59e0b" },
];
