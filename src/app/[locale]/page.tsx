import { getSettings } from "@/lib/queries/settings";
import { getProducts } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";
import { getTestimonials } from "@/lib/queries/testimonials";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { ScrollStory } from "@/components/home/ScrollStory";
import { Stats } from "@/components/home/Stats";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import type { Locale } from "@/lib/i18n/messages";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const [settings, { locale }] = await Promise.all([getSettings(), params]);
  const configuredTitle = locale === "en" ? settings.seo_title_en : settings.seo_title_vi;
  const brandPrefix = `${settings.store_name} — `;
  const title = configuredTitle?.startsWith(brandPrefix) ? configuredTitle.slice(brandPrefix.length) : configuredTitle;
  const description = locale === "en" ? settings.seo_description_en : settings.seo_description_vi;
  const metaTitle = title || settings.store_name;
  const metaDescription = description || (locale === "en" ? settings.slogan_en : settings.slogan) || "";
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: localizedAlternates(locale, "/", "/en"),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      locale: locale === "en" ? "en_US" : "vi_VN",
      type: "website",
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const [settings, products, categories, testimonials] = await Promise.all([
    getSettings(),
    getProducts(),
    getCategories(),
    getTestimonials(),
  ]);

  const heroImage = settings.hero_image_url ?? products[0]?.images[0] ?? null;
  const orderedSections = Array.isArray(settings.homepage_sections) ? settings.homepage_sections.filter((item): item is string => typeof item === "string") : ["hero", "marquee", "categories", "featured", "story", "stats", "testimonials", "newsletter"];
  const storyImages = [products[0], products[1], products[2]].map((p) => ({
    url: p?.images[0] ?? null,
    alt: p ? (locale === "en" ? p.name_en || p.name : p.name) : "",
  }));
  const sections: Record<string, ReactNode> = {
    hero: <Hero locale={locale} headline={(locale === "en" ? settings.hero_headline_en : settings.hero_headline) || settings.store_name} subheadline={(locale === "en" ? settings.hero_subheadline_en : settings.hero_subheadline) || (locale === "en" ? settings.slogan_en : settings.slogan)} imageUrl={heroImage} imageAlt={products[0] ? (locale === "en" ? products[0].name_en || products[0].name : products[0].name) : settings.store_name} primaryLabel={locale === "en" ? settings.hero_cta_label_en : settings.hero_cta_label_vi} />,
    marquee: <Marquee items={categories.map((c) => (locale === "en" ? c.name_en || c.name : c.name).toUpperCase())} />,
    categories: <CategoryShowcase categories={categories} locale={locale} />,
    featured: <FeaturedGrid products={products} locale={locale} />,
    story: <ScrollStory storeName={settings.store_name} images={storyImages} locale={locale} />,
    stats: <Stats products={products} categoryCount={categories.length} locale={locale} />,
    testimonials: <Testimonials testimonials={testimonials} locale={locale} />,
    newsletter: <Newsletter locale={locale} />,
  };

  return (
    <>{orderedSections.map((key) => <div key={key}>{sections[key]}</div>)}</>
  );
}
