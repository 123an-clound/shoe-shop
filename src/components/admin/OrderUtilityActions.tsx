"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export function OrderUtilityActions({ code, address, printable = true }: { code: string; address: string; printable?: boolean }) {
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); toast.success("Đã sao chép"); }
    catch { toast.error("Không sao chép được. Bạn có thể chọn và sao chép trực tiếp nội dung."); }
  }
  return <div className="flex flex-wrap gap-2">
    <Button type="button" variant="glass" onClick={() => copy(code)}>Sao chép mã đơn</Button>
    <Button type="button" variant="glass" onClick={() => copy(address)}>Sao chép địa chỉ</Button>
    <Button type="button" variant="glass" disabled={!printable} onClick={() => window.print()}>In phiếu đóng gói</Button>
  </div>;
}
