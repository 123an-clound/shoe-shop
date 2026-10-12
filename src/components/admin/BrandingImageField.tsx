"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadSettingsImage } from "@/lib/actions/settings";
import { convertImageToWebp } from "@/lib/convertImageToWebp";

export function BrandingImageField({
  label,
  path,
  value,
  onChange,
}: {
  label: string;
  path: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    let result;
    try {
      const webp = await convertImageToWebp(file);
      const formData = new FormData();
      const role = path.endsWith("logo") ? "logo" : "hero";
      formData.set("file", webp);
      formData.set("path", `branding/${role}-${window.crypto.randomUUID()}.webp`);
      result = await uploadSettingsImage(formData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được ảnh. Hãy thử lại.");
      return;
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    // Thêm tham số thời gian để trình duyệt không hiện ảnh cũ từ cache.
    onChange(`${result.url}?v=${Date.now()}`);
  }

  return (
    <div>
      <label className="text-sm text-fg-muted">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
          {value ? (
            <Image src={value} alt="" fill sizes="80px" className="object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5 text-fg-subtle" aria-hidden="true" />
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-fg-muted transition-colors hover:border-brand hover:text-fg disabled:opacity-50"
          >
            {uploading ? "Đang tải..." : "Tải ảnh lên"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              aria-label={`Xóa ${label}`}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-fg-muted hover:text-red-400 disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <p className="mt-2 text-xs text-fg-muted">Ảnh được tối ưu và tải lên dưới dạng WebP.</p>
    </div>
  );
}
