import { getSettings } from "@/lib/queries/settings";

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">
        {settings.hero_headline ?? settings.store_name}
      </h1>
      {settings.hero_subheadline && (
        <p className="max-w-xl text-fg-muted">{settings.hero_subheadline}</p>
      )}
      <p className="mt-6 text-sm text-fg-subtle">
        Trang chủ đầy đủ (Hero, ScrollStory, sản phẩm nổi bật…) sẽ được xây ở
        Phase 3.
      </p>
    </div>
  );
}
