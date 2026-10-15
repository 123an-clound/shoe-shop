import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/securityHeaders";

const supabaseHost = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtizooyjnllostamffpp.supabase.co",
).hostname;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() { return [{ source: "/(.*)", headers: securityHeaders() }]; },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
