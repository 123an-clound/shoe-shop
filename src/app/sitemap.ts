import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/queries/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/san-pham`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/ve-chung-toi`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/lien-he`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/san-pham/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
