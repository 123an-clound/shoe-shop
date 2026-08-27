"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GripVertical, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/actions/products";
import { cn } from "@/lib/cn";

const MAX_IMAGES = 3;

/** Kéo thả tối đa 3 ảnh lên Storage, xem trước, sắp xếp lại thứ tự (mục 5.7 PLAN.md). */
export function ImageUploader({
  slug,
  value,
  onChange,
}: {
  slug: string;
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!slug) {
      toast.error("Nhập tên sản phẩm trước khi tải ảnh lên.");
      return;
    }

    const remainingSlots = MAX_IMAGES - value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (filesToUpload.length === 0) {
      toast.error("Đã đủ 3 ảnh.");
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];
    for (const [i, file] of filesToUpload.entries()) {
      const index = value.length + i + 1;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${slug}-${index}.${ext}`;
      const formData = new FormData();
      formData.set("file", file);
      formData.set("path", path);
      const result = await uploadProductImage(formData);
      if (!result.success) {
        toast.error(result.error);
        continue;
      }
      newUrls.push(result.url);
    }
    setUploading(false);
    if (newUrls.length > 0) onChange([...value, ...newUrls]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleDropReorder(index: number) {
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {value.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={() => {
              dragIndexRef.current = index;
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDrop={() => handleDropReorder(index)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg border-2 bg-ink-800",
              dragOverIndex === index ? "border-brand" : "border-transparent",
            )}
          >
            <Image src={url} alt="" fill sizes="150px" className="object-cover" />
            <div className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-ink-950/70 text-fg-subtle">
              <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Xóa ảnh"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/70 text-fg opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}

        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink-700 text-fg-subtle transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs">{uploading ? "Đang tải..." : "Thêm ảnh"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-fg-subtle">Tối đa 3 ảnh. Kéo để sắp xếp lại thứ tự.</p>
    </div>
  );
}
