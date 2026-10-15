"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/cn";
import { deleteProduct, toggleProductPublish } from "@/lib/actions/products";
import type { AdminProduct } from "@/lib/queries/admin";
import type { Category } from "@/lib/queries/categories";
import { getProductColors, hasVariantInventory } from "@/lib/productVariants";

export function ProductsTable({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: Category[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filtered = products.filter((product) => {
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && product.category_id !== categoryFilter) return false;
    return true;
  });

  async function handleTogglePublish(product: AdminProduct) {
    if (busyProductId) return;
    setBusyProductId(product.id);
    try {
      const result = await toggleProductPublish(product.id, !product.is_published);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(product.is_published ? "Đã ẩn sản phẩm" : "Đã publish sản phẩm");
      router.refresh();
    } catch {
      toast.error("Không kết nối được. Trạng thái sản phẩm chưa được xác nhận.");
      router.refresh();
    } finally {
      setBusyProductId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || busyProductId) return;
    setBusyProductId(deleteTarget.id);
    try {
      const result = await deleteProduct(deleteTarget.id, deleteTarget.updated_at);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Đã xóa sản phẩm");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Không kết nối được. Chưa thể xác nhận việc xóa sản phẩm.");
      router.refresh();
    } finally {
      setBusyProductId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          aria-label="Tìm sản phẩm theo tên"
          placeholder="Tìm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 flex-1 rounded-lg border border-ink-700 bg-ink-900 px-4 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
        />
        <select
          aria-label="Lọc danh mục sản phẩm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 rounded-lg border border-ink-700 bg-ink-900 px-4 text-sm text-fg focus:border-brand focus:outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 lg:hidden">
        {filtered.map((product) => <article key={product.id} className="min-w-0 rounded-xl border border-ink-700 bg-ink-900 p-4">
          <div className="flex items-start gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-800">{product.images[0] && <Image src={product.images[0]} alt="" fill sizes="64px" className="object-cover" />}</div>
            <div className="min-w-0 flex-1"><Link href={`/admin/san-pham/${product.id}`} className="font-medium text-fg [overflow-wrap:anywhere] underline">{product.name}</Link><p className="mt-1 text-sm text-fg-muted">{categoryMap.get(product.category_id ?? "") ?? "—"}</p><p className="mt-1 text-sm tabular-nums text-fg">{formatVND(product.price)} · {product.stock} đôi</p></div>
          </div>
          {hasVariantInventory(getProductColors(product.colors)) ? <details className="mt-2 text-sm text-fg-muted"><summary className="flex min-h-11 cursor-pointer items-center text-brand">Theo màu & size</summary><ul className="space-y-2">{getProductColors(product.colors).map((color) => <li key={color.hex}>{color.name}: {(color.inventory ?? []).map((entry) => `${entry.size}: ${entry.quantity}`).join(" · ")}</li>)}</ul></details> : <p className="mt-2 text-xs text-fg-muted">Chưa phân bổ biến thể</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-700 pt-3">
            <Link href={`/admin/san-pham/${product.id}/ton-kho`} className="flex min-h-11 items-center rounded-lg border border-ink-700 px-3 text-sm text-fg">Tồn kho</Link>
            <Link href={`/admin/san-pham/${product.id}`} aria-label={`Sửa ${product.name}`} className="flex min-h-11 items-center rounded-lg border border-ink-700 px-3 text-sm text-fg">Sửa</Link>
            <button type="button" aria-pressed={product.is_published} disabled={busyProductId !== null} onClick={() => handleTogglePublish(product)} className="min-h-11 rounded-lg border border-ink-700 px-3 text-sm text-fg disabled:opacity-50">{product.is_published ? "Đang hiển thị" : "Đang ẩn"}</button>
            <button type="button" disabled={busyProductId !== null} onClick={() => setDeleteTarget(product)} aria-label={`Xóa ${product.name}`} className="ml-auto min-h-11 rounded-lg px-3 text-sm text-red-400 disabled:opacity-50">Xóa</button>
          </div>
        </article>)}
        {filtered.length === 0 && <p className="py-8 text-center text-fg-muted">Không tìm thấy sản phẩm.</p>}
      </div>
      <div className="mt-4 hidden overflow-x-auto rounded-[var(--radius-card)] border border-ink-700 lg:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-ink-900 text-left text-fg-muted">
            <tr>
              <th className="p-3 font-medium">Ảnh</th>
              <th className="p-3 font-medium">Tên</th>
              <th className="p-3 font-medium">Danh mục</th>
              <th className="p-3 font-medium">Giá</th>
              <th className="p-3 font-medium">Tồn kho</th>
              <th className="p-3 font-medium">Publish</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-t border-ink-700">
                <td className="p-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-ink-800">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="p-3 text-fg">{product.name}</td>
                <td className="p-3 text-fg-muted">
                  {categoryMap.get(product.category_id ?? "") ?? "—"}
                </td>
                <td className="p-3 tabular-nums text-fg">{formatVND(product.price)}</td>
                <td className="p-3 tabular-nums text-fg-muted">
                  <span>{product.stock} đôi</span>
                  {hasVariantInventory(getProductColors(product.colors)) ? (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-brand focus-visible:outline-2 focus-visible:outline-brand">Theo màu & size</summary>
                      <ul className="mt-2 flex flex-col gap-1 text-xs">
                        {getProductColors(product.colors).map((color) => <li key={color.hex}><span className="font-medium text-fg">{color.name}:</span> {(color.inventory ?? []).map((entry) => `${entry.size}: ${entry.quantity}`).join(" · ")}</li>)}
                      </ul>
                    </details>
                  ) : <span className="mt-1 block text-xs">Chưa phân bổ biến thể</span>}
                  <Link href={`/admin/san-pham/${product.id}/ton-kho`} aria-label={`Điều chỉnh tồn kho ${product.name}`} className="mt-1 inline-flex min-h-11 items-center text-xs text-fg underline focus-visible:outline-2 focus-visible:outline-brand">Điều chỉnh tồn kho</Link>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(product)}
                    aria-pressed={product.is_published}
                    aria-label={`${product.is_published ? "Tắt" : "Bật"} hiển thị ${product.name}`}
                    disabled={busyProductId !== null}
                    className={cn(
                      "h-9 w-12 rounded-full p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60",
                      product.is_published ? "bg-brand" : "bg-ink-700",
                    )}
                  >
                    <span
                      className={cn(
                        "block h-7 w-7 rounded-full bg-fg transition-transform",
                        product.is_published ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/san-pham/${product.id}`}
                      aria-label={`Sửa ${product.name}`}
                      className="text-fg-muted hover:text-fg"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      aria-label={`Xóa ${product.name}`}
                      className="text-fg-subtle hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-fg-muted">Không có sản phẩm phù hợp.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa sản phẩm"
        description="Sản phẩm sẽ bị xóa khỏi cửa hàng. Tệp ảnh được giữ lại để tránh làm hỏng nội dung khác đang dùng chung ảnh."
        expectedText={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
