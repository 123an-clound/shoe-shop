import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Cài đặt — Quản trị" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-fg">Cài đặt cửa hàng</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Đổi tên, khẩu hiệu, màu thương hiệu — mọi thay đổi áp dụng ngay cho toàn bộ trang.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
