import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

export type Settings = Tables<"veloce_settings">;

async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabasePublic
    .from("veloce_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error("Không đọc được cài đặt cửa hàng từ Supabase.");
  }

  return data;
}

/** Cache theo tag "settings" — admin ghi xong gọi revalidateTag("settings") để làm mới. */
export const getSettings = unstable_cache(fetchSettings, ["veloce-settings"], {
  tags: ["settings"],
});
