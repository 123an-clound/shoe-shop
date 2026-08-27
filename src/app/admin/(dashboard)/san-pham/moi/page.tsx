import type { Metadata } from "next";
import { getCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Thêm sản phẩm — Quản trị" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Thêm sản phẩm</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
