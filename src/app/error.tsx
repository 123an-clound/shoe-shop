"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-2xl font-bold text-fg">Có lỗi xảy ra</h1>
      <p className="text-fg-muted">
        Rất tiếc, trang gặp sự cố khi tải. Thử lại hoặc quay về trang chủ.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={reset} variant="glass">
          Thử lại
        </Button>
        <Button href="/">Về trang chủ</Button>
      </div>
    </div>
  );
}
