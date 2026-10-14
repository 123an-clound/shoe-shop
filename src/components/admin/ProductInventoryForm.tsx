"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ProductInventoryInputs } from "@/components/admin/ProductInventoryInputs";
import { getProductColors, hasVariantInventory } from "@/lib/productVariants";
import { productInventorySchema, toInventoryInput } from "@/lib/validation/inventory";
import { updateProductInventory } from "@/lib/actions/inventory";
import type { AdminProduct } from "@/lib/queries/admin";
import { getSizeLabel } from "@/lib/sizeLabels";

type InventoryProduct = Pick<AdminProduct, "id" | "name" | "colors" | "sizes" | "stock" | "updated_at" | "size_guide">;

export function ProductInventoryForm({ product }: { product: InventoryProduct }) {
  const router = useRouter();
  const [colors, setColors] = useState(() => getProductColors(product.colors));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const canEdit = colors.length > 0 && product.sizes.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const parsed = productInventorySchema.safeParse(toInventoryInput(colors));
    setError("");
    setErrors({});
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const colorIndex = issue.path[1];
        const inventoryIndex = issue.path[3];
        if (typeof colorIndex === "number" && typeof inventoryIndex === "number") {
          const size = colors[colorIndex]?.inventory?.[inventoryIndex]?.size;
          if (size !== undefined) nextErrors[`${colorIndex}.${size}`] = issue.message;
        }
      });
      setErrors(nextErrors);
      setError(parsed.error.issues[0]?.message ?? "Kiểm tra lại số lượng tồn kho.");
      return;
    }
    setSaving(true);
    try {
      const result = await updateProductInventory(product.id, product.updated_at, parsed.data);
      if (!result.success) {
        setError(result.error);
        return;
      }
      toast.success("Đã lưu tồn kho theo màu và size");
      router.push("/admin/san-pham");
      router.refresh();
    } catch {
      setError("Không kết nối được để lưu tồn kho. Số lượng bạn nhập vẫn được giữ lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-5" aria-busy={saving}>
      <p className="text-sm text-fg-muted">Điều chỉnh số lượng của <strong className="text-fg">{product.name}</strong>. Tổng tồn kho được tính từ tất cả màu và size.</p>
      <ProductInventoryInputs colors={colors} sizes={product.sizes} stock={product.stock} errors={errors} disabled={saving} sizeLabels={Object.fromEntries(product.sizes.map((size) => [size, getSizeLabel(product.size_guide, size)]))}
        onChange={(next) => { setColors(next); setDirty(true); setErrors({}); setError(""); }} />
      {!canEdit && <Link href={`/admin/san-pham/${product.id}`} className="inline-flex min-h-11 items-center text-sm text-fg underline focus-visible:outline-2 focus-visible:outline-brand">Mở sản phẩm để thêm màu và size</Link>}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving || !dirty || !canEdit || !hasVariantInventory(colors)}>{saving ? "Đang lưu..." : "Lưu tồn kho"}</Button>
        <Button type="button" variant="ghost" disabled={saving} onClick={() => router.push("/admin/san-pham")}>Quay lại</Button>
      </div>
    </form>
  );
}
