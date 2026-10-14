import { notFound } from "next/navigation";
import { z } from "zod";
import { getAdminProductById } from "@/lib/queries/admin";
import { ProductInventoryForm } from "@/components/admin/ProductInventoryForm";

export const metadata = { title: "Điều chỉnh tồn kho — Quản trị" };

export default async function ProductInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const product = await getAdminProductById(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Điều chỉnh tồn kho</h1>
      <ProductInventoryForm key={product.updated_at} product={{ id: product.id, name: product.name, colors: product.colors, sizes: product.sizes, stock: product.stock, updated_at: product.updated_at, size_guide: product.size_guide }} />
    </div>
  );
}
