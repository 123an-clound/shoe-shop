"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/actions/products";
import { cn } from "@/lib/cn";
import { MAX_PRODUCT_IMAGES } from "@/lib/validation/product";
import { convertImageToWebp } from "@/lib/convertImageToWebp";

/** Tải ảnh lên Storage, xem trước và sắp xếp lại thứ tự. */
export function ImageUploader({
  slug,
  value,
  onChange,
  onUploadingChange,
}: {
  slug: string;
  value: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || uploading) return;
    if (!slug) {
      toast.error("Nhập tên sản phẩm trước khi tải ảnh lên.");
      return;
    }

    const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - value.length);
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (filesToUpload.length === 0) {
      toast.error(`Đã đủ ${MAX_PRODUCT_IMAGES} ảnh.`);
      return;
    }
    if (files.length > remainingSlots) {
      toast.info(`Chỉ tải thêm ${remainingSlots} ảnh để đủ tối đa ${MAX_PRODUCT_IMAGES} ảnh.`);
    }

    setUploading(true);
    onUploadingChange?.(true);
    const newUrls: string[] = [];
    for (const [i, file] of filesToUpload.entries()) {
      const index = value.length + i + 1;
      try {
        const webp = await convertImageToWebp(file);
        const path = `products/${slug}-${index}-${window.crypto.randomUUID()}.webp`;
        const formData = new FormData();
        formData.set("file", webp);
        formData.set("path", path);
        const result = await uploadProductImage(formData);
        if (!result.success) {
          toast.error(result.error);
          continue;
        }
        newUrls.push(result.url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không tải được ảnh. Hãy thử lại.");
      }
    }
    if (newUrls.length > 0) onChange([...value, ...newUrls]);
    setUploading(false);
    onUploadingChange?.(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveAt(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= value.length) return;
    const next = [...value];
    [next[index], next[destination]] = [next[destination]!, next[index]!];
    onChange(next);
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
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
        {value.map((url, index) => (
          <div
            key={url}
            draggable={!uploading}
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
            <div className="absolute right-1 top-1 flex gap-1">
              <button type="button" onClick={() => moveAt(index, -1)} disabled={uploading || index === 0} aria-label={`Đưa ảnh ${index + 1} lên trước`} className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950/80 text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40">
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => moveAt(index, 1)} disabled={uploading || index === value.length - 1} aria-label={`Đưa ảnh ${index + 1} xuống sau`} className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950/80 text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => removeAt(index)} disabled={uploading} aria-label={`Xóa ảnh ${index + 1}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950/80 text-fg hover:text-red-400 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        {value.length < MAX_PRODUCT_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink-700 text-fg-muted hover:border-brand hover:text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs">{uploading ? "Đang tải..." : "Thêm ảnh"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-fg-muted">{value.length}/{MAX_PRODUCT_IMAGES} ảnh (tối đa {MAX_PRODUCT_IMAGES}). Ảnh đầu tiên là ảnh đại diện. Kéo để sắp xếp lại thứ tự.</p>
      <p className="mt-1 text-xs text-fg-muted">JPG/PNG/WebP/AVIF được tự động tối ưu thành WebP, cạnh dài tối đa 2.000 px.</p>
    </div>
  );
}
