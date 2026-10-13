"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function OrderRefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const timer = window.setInterval(() => {
      const active = document.activeElement;
      if (document.visibilityState !== "visible" || pending || active?.matches("input,textarea,select,button")) return;
      startTransition(() => router.refresh());
    }, 45000);
    return () => window.clearInterval(timer);
  }, [router, pending, startTransition]);
  return <div className="flex flex-col items-end gap-1.5"><Button type="button" variant="glass" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Đang cập nhật..." : "Làm mới"}</Button><span className="text-xs text-fg-muted">Tự cập nhật mỗi 45 giây</span></div>;
}
