"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { slugify } from "@/lib/slugify";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/queries/categories";

function CategoryRow({
  category,
  onDeleteRequest,
}: {
  category: Category;
  onDeleteRequest: (category: Category) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [saving, setSaving] = useState(false);
  const dirty = name !== category.name || slug !== category.slug;

  async function handleSave() {
    setSaving(true);
    const result = await updateCategory(category.id, { name, slug });
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã lưu danh mục");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900 p-3">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
      <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1" />
      {dirty && (
        <Button type="button" variant="glass" size="md" disabled={saving} onClick={handleSave}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      )}
      <button
        type="button"
        onClick={() => onDeleteRequest(category)}
        aria-label={`Xóa ${category.name}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-fg-subtle hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createCategory({ name: newName, slug: slugify(newName) });
    setCreating(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã thêm danh mục");
    setNewName("");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteCategory(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã xóa danh mục");
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} onDeleteRequest={setDeleteTarget} />
      ))}

      <div className="flex items-center gap-3 rounded-lg border border-dashed border-ink-700 p-3">
        <Input
          placeholder="Tên danh mục mới"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="glass" disabled={creating} onClick={handleCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa danh mục"
        description="Chỉ xóa được khi không còn sản phẩm nào thuộc danh mục này."
        expectedText={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
