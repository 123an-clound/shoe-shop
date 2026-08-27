import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/queries/admin";
import { getCategories } from "@/lib/queries/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Sửa sản phẩm — Quản trị" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Sửa sản phẩm</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
