import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập quản trị" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-2xl font-bold text-fg">Đăng nhập quản trị</h1>
      <p className="mt-1 text-sm text-fg-muted">Chỉ dành cho quản trị viên.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
