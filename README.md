# VELOCE (tên tạm) — Website bán giày nam + trang quản trị

Storefront thương mại điện tử + trang quản trị, xây bằng Next.js 16 (App Router)
+ TypeScript strict + Tailwind CSS v4 + Supabase. Xem đặc tả đầy đủ ở `PLAN.md`
và quy ước bắt buộc ở `CLAUDE.md`.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Cần file `.env.local` (đã có sẵn, không commit) với `NEXT_PUBLIC_SUPABASE_URL`
và `NEXT_PUBLIC_SUPABASE_ANON_KEY` — xem `PLAN.md` mục 1.

## Lệnh khác

```bash
npm run build        # build production — phải sạch, không lỗi TypeScript
npm run gen:images   # tải + cắt + upload ảnh sản phẩm lên Supabase Storage (Phase 2)
npx supabase gen types typescript --project-id jtizooyjnllostamffpp > src/types/database.ts
```

## Tiến độ

Xem mục 7 của `PLAN.md` cho lộ trình theo phase. Trạng thái hiện tại được cập
nhật qua các commit `feat(phase-N): ...`.
