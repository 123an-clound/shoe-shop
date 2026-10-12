"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ADMIN_THEME_COOKIE, type AdminTheme } from "@/lib/adminTheme";

const AdminThemeContext = createContext<{ theme: AdminTheme; setTheme: (theme: AdminTheme) => void } | null>(null);

export function AdminThemeProvider({ initialTheme, children }: { initialTheme: AdminTheme; children: ReactNode }) {
  const [theme, updateTheme] = useState(initialTheme);

  function setTheme(next: AdminTheme) {
    updateTheme(next);
    document.cookie = `${ADMIN_THEME_COOKIE}=${next}; Path=/admin; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme }}>
      <div data-admin-theme={theme} className="admin-shell min-h-screen bg-ink-950 text-fg">{children}</div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) throw new Error("AdminThemeProvider chưa được khởi tạo.");
  return context;
}
