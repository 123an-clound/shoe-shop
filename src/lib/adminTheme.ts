export const ADMIN_THEME_COOKIE = "veloce-admin-theme";
export type AdminTheme = "light" | "dark";

export function getAdminTheme(value: string | undefined): AdminTheme {
  return value === "dark" ? "dark" : "light";
}
