"use client";

import "./globals.css";

/**
 * Bắt lỗi ngay trong root layout (ví dụ Supabase không phản hồi khi đọc settings).
 * Không đọc settings ở đây vì chính việc đọc đó có thể là nguyên nhân lỗi.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen items-center justify-center bg-ink-950 px-4 text-center text-fg">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-display text-2xl font-bold">Không thể tải trang</h1>
          <p className="text-fg-muted">
            Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand px-6 py-3 text-sm font-medium text-on-brand"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
