import type { Metadata } from "next";
import { getProducts } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";
import { getSettings } from "@/lib/queries/settings";
import { ProductListing } from "@/components/product/ProductListing";
import type { Locale } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const settings = await getSettings();
  const { locale } = await params;
  return {
    title: locale === "en" ? "Shop" : "Sản phẩm",
    description: locale === "en" ? `Shop the latest footwear from ${settings.store_name}.` : `Toàn bộ giày nam đang bán tại ${settings.store_name}.`,
    alternates: localizedAlternates(locale, "/san-pham", "/en/san-pham"),
  };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return <ProductListing products={products} categories={categories} locale={locale} />;
}
