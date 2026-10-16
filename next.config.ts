import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/securityHeaders";

const supabaseHost = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jtizooyjnllostamffpp.supabase.co",
).hostname;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    // Rewrite sau Proxy để đường /vi nội bộ không chạy lại canonical redirect.
    return { beforeFiles: [], afterFiles: [{
      source: "/:path((?!en(?:/|$)|vi(?:/|$)|admin(?:/|$)|api(?:/|$)|_next(?:/|$)|robots\\.txt$|sitemap\\.xml$|opengraph-image$|favicon\\.ico$).*)",
      destination: "/vi/:path",
    }], fallback: [] };
  },
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
