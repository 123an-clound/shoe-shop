"use client";

import { useRef, useState } from "react";
import { Video, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createProductVideoUpload, completeProductVideoUpload } from "@/lib/actions/productMedia";
import { videoValidationError } from "@/lib/validation/video";

export function VideoUploader({ slug, value, onChange, onUploadingChange }: {
  slug: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUploadingChange: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    onUploadingChange(true);
    try {
      const validationError = videoValidationError(file.type, file.size, file.name.toLowerCase(), new Uint8Array(await file.slice(0, 12).arrayBuffer()));
      if (validationError) throw new Error(validationError);
      const session = await createProductVideoUpload({ slug, type: file.type, size: file.size });
      if (!session.success) throw new Error(session.error);
      // Tải trực tiếp lên Storage, tránh giới hạn kích thước body của Server Action/Vercel.
      const { error } = await createClient().storage.from("veloce").uploadToSignedUrl(session.path, session.token, file, { contentType: file.type, cacheControl: "31536000" });
      if (error) throw new Error("Không tải được video. Kiểm tra kết nối và thử lại.");
      const result = await completeProductVideoUpload(session.path);
      if (!result.success) throw new Error(result.error);
      onChange(result.url);
      toast.success("Video đã tải lên. Lưu sản phẩm để hiển thị trên cửa hàng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được video.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900 p-4">
      <p className="text-sm font-medium text-fg">Video sản phẩm</p>
      <p className="mt-1 text-xs text-fg-muted">1 video MP4/WebM, tối đa 50 MB. Video phát khi khách chọn xem.</p>
      {value && <video key={value} src={value} controls playsInline preload="none" aria-label="Xem trước video sản phẩm" className="mt-3 max-h-64 w-full rounded-lg bg-ink-950" />}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-ink-700 px-4 text-sm text-fg hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50">
          <Video className="h-4 w-4" aria-hidden="true" />{uploading ? "Đang tải video..." : value ? "Thay video" : "Tải video lên"}
        </button>
        {value && <button type="button" onClick={() => onChange(null)} disabled={uploading} aria-label="Xóa video khỏi sản phẩm"
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-fg-muted hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"><X className="h-4 w-4" aria-hidden="true" />Xóa video</button>}
      </div>
      <input ref={inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
    </div>
  );
}
