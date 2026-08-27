import type { Metadata } from "next";
import { getCategories } from "@/lib/queries/categories";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata: Metadata = { title: "Danh mục — Quản trị" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Danh mục</h1>
      <CategoriesManager categories={categories} />
    </div>
  );
}
