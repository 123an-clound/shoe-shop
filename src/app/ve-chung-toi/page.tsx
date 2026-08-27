import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getProducts } from "@/lib/queries/products";
import { Reveal } from "@/components/ui/Reveal";
import { ParallaxImage } from "@/components/about/ParallaxImage";
import { AboutTimeline } from "@/components/about/AboutTimeline";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Về chúng tôi",
    description: `Câu chuyện phía sau ${settings.store_name}.`,
  };
}

export default async function AboutPage() {
  const [settings, products] = await Promise.all([getSettings(), getProducts()]);

  const milestones = [
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
        <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">Về chúng tôi</h1>
        <p className="mt-4 text-lg text-fg-muted">{settings.slogan}</p>
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
          Sẵn sàng chọn đôi giày của bạn?
        </h2>
        <Button href="/san-pham" className="mt-6">
          Khám phá sản phẩm
        </Button>
      </Reveal>
    </div>
  );
}
