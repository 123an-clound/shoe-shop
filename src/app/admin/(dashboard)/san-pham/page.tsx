import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/queries/admin";
import { getCategories } from "@/lib/queries/categories";
import { Button } from "@/components/ui/Button";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata: Metadata = { title: "Sản phẩm — Quản trị" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-fg">Sản phẩm</h1>
        <Button href="/admin/san-pham/moi">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm sản phẩm
        </Button>
      </div>
      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
