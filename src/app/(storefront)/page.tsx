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

export default async function HomePage() {
  const [settings, products, categories, testimonials] = await Promise.all([
    getSettings(),
    getProducts(),
    getCategories(),
    getTestimonials(),
  ]);

  const heroImage = settings.hero_image_url ?? products[0]?.images[0] ?? null;
  const storyImages = [products[0], products[1], products[2]].map((p) => ({
    url: p?.images[0] ?? null,
    alt: p?.name ?? "",
  }));

  return (
    <>
      <Hero
        headline={settings.hero_headline ?? settings.store_name}
        subheadline={settings.hero_subheadline}
        imageUrl={heroImage}
        imageAlt={products[0]?.name ?? settings.store_name}
      />
      <Marquee items={categories.map((c) => c.name.toUpperCase())} />
      <CategoryShowcase categories={categories} />
      <FeaturedGrid products={products} />
      <ScrollStory storeName={settings.store_name} images={storyImages} />
      <Stats products={products} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  );
}
