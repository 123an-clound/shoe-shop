import type { NextConfig } from "next";

const supabaseHost = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtizooyjnllostamffpp.supabase.co",
).hostname;

const nextConfig: NextConfig = {
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
