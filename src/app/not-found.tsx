import { Button } from "@/components/ui/Button";
import { getSettings } from "@/lib/queries/settings";

export default async function NotFound() {
  const settings = await getSettings();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="font-display text-2xl font-bold text-fg">Không tìm thấy trang</h1>
      <p className="text-fg-muted">
        Trang bạn tìm không tồn tại hoặc đã được chuyển đi. Quay lại{" "}
        {settings.store_name} để tiếp tục xem giày.
      </p>
      <Button href="/" className="mt-2">
        Về trang chủ
      </Button>
    </div>
  );
}
