import "server-only";
export async function getCustomerProviders() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! }, next: { revalidate: 60 }, signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Auth settings unavailable");
    const data = await response.json();
    return { phone: data.external?.phone === true, google: data.external?.google === true, available: true };
  } catch { return { phone: false, google: false, available: false }; }
}
