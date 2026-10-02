import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/gio-hang", "/thanh-toan", "/en/gio-hang", "/en/thanh-toan"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
