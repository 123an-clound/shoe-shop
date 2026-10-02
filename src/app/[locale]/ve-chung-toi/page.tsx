import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getProducts } from "@/lib/queries/products";
import { Reveal } from "@/components/ui/Reveal";
import { ParallaxImage } from "@/components/about/ParallaxImage";
import { AboutTimeline } from "@/components/about/AboutTimeline";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const settings = await getSettings();
  const { locale } = await params;
  return {
    title: locale === "en" ? "Our story" : "Về chúng tôi",
    description: locale === "en" ? `The story behind ${settings.store_name}.` : `Câu chuyện phía sau ${settings.store_name}.`,
    alternates: localizedAlternates(locale, "/ve-chung-toi", "/en/ve-chung-toi"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = getMessages(locale);
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);

  const milestones = locale === "en" ? [
    { year: "The beginning", title: "A simple idea", body: `${settings.store_name} began with a belief: great shoes should be accessible, carefully made, and built from the right materials.` },
    { year: "Selection", title: "Working directly with makers", body: "We work closely with our workshops and inspect every leather and sole before production." },
    { year: "Growing", title: "From a few styles to a collection", body: "From everyday sneakers to office shoes, every style belongs because people need it." },
    { year: "Today", title: "One standard stays", body: "We sell shoes our own team is happy to wear every day. That is the standard we keep." },
  ] : [
    {
      year: "Khởi đầu",
      title: "Một ý tưởng đơn giản",
      body: `${settings.store_name} bắt đầu từ niềm tin rằng giày tốt không cần phải đắt — chỉ cần đúng chất liệu, đúng phom, và làm cẩn thận.`,
    },
    {
      year: "Chọn lọc",
      title: "Làm việc trực tiếp với xưởng",
      body: "Không qua trung gian. Mỗi lô da, mỗi lô cao su đế đều được kiểm trước khi lên chuyền, để giá tốt mà chất lượng không đổi.",
    },
    {
      year: "Phát triển",
      title: "Từ vài mẫu đến một bộ sưu tập",
      body: "Từ sneaker hằng ngày đến giày da công sở, mỗi dòng sản phẩm được thêm vào vì có người thật sự cần, không phải để lấp đầy danh mục.",
    },
    {
      year: "Hôm nay",
      title: "Vẫn giữ một nguyên tắc",
      body: "Bán đôi giày mà chính đội ngũ cũng sẵn sàng mang mỗi ngày. Đó là tiêu chuẩn duy nhất chúng tôi không thỏa hiệp.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">{copy.about.title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{locale === "en" ? settings.slogan_en || settings.slogan : settings.slogan}</p>
      </Reveal>

      <div className="mt-12">
        <ParallaxImage
          src={settings.hero_image_url ?? products[0]?.images[0] ?? null}
          alt={settings.store_name}
        />
      </div>

      <div className="mt-24">
        <AboutTimeline milestones={milestones} />
      </div>

      <Reveal className="mt-24 text-center">
        <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">
          {locale === "en" ? "Ready to find your next pair?" : "Sẵn sàng chọn đôi giày của bạn?"}
        </h2>
        <Button href="/san-pham" className="mt-6">
          {copy.about.cta}
        </Button>
      </Reveal>
    </div>
  );
}
