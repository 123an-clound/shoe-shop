import type { Metadata } from "next";
import { getProducts } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";
import { getSettings } from "@/lib/queries/settings";
import { ProductListing } from "@/components/product/ProductListing";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Sản phẩm — ${settings.store_name}`,
    description: `Toàn bộ giày nam đang bán tại ${settings.store_name}.`,
  };
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return <ProductListing products={products} categories={categories} />;
}
