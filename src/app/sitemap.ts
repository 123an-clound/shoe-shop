import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/queries/products";
import { SITE_URL } from "@/lib/seo";

const BASE_URL = SITE_URL.origin;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const routes = [
    { vi: "/", en: "/en", changeFrequency: "daily" as const, priority: 1 },
    { vi: "/san-pham", en: "/en/san-pham", changeFrequency: "daily" as const, priority: 0.9 },
    { vi: "/ve-chung-toi", en: "/en/ve-chung-toi", changeFrequency: "monthly" as const, priority: 0.5 },
    { vi: "/lien-he", en: "/en/lien-he", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = routes.flatMap((route) => {
    const languages = {
      "vi-VN": new URL(route.vi, BASE_URL).toString(),
      "en-US": new URL(route.en, BASE_URL).toString(),
      "x-default": new URL(route.vi, BASE_URL).toString(),
    };

    return [route.vi, route.en].map((path) => ({
      url: new URL(path, BASE_URL).toString(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages },
    }));
  });

  const productRoutes: MetadataRoute.Sitemap = products.flatMap((product) => {
    const viPath = `/san-pham/${product.slug}`;
    const enPath = `/en${viPath}`;
    const languages = {
      "vi-VN": new URL(viPath, BASE_URL).toString(),
      "en-US": new URL(enPath, BASE_URL).toString(),
      "x-default": new URL(viPath, BASE_URL).toString(),
    };

    return [viPath, enPath].map((path) => ({
      url: new URL(path, BASE_URL).toString(),
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: { languages },
    }));
  });

  return [...staticRoutes, ...productRoutes];
}
