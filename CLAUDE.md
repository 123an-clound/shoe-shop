# CLAUDE.md — Quy ước bắt buộc cho dự án VELOCE (shoe-shop)

> Claude Code tự đọc file này mỗi phiên. Đặc tả chi tiết ở `PLAN.md` — file này chỉ chứa những quy ước **không được vi phạm**, cô đọng để luôn nằm trong context.

## Dự án là gì
Website bán giày nam + **trang quản trị đầy đủ quyền**.
Next.js 16 (App Router) + TypeScript strict + Tailwind CSS v4 + **Supabase** (Postgres + Auth + Storage).
Giao diện tiếng Việt, tiền VND định dạng `2.890.000₫`.

**Đây là sản phẩm mẫu An dùng để demo và bán cho chủ shop giày**, rồi tùy biến lại cho từng khách. Hệ quả:
- **"VELOCE" là TÊN TẠM. Không hardcode chuỗi đó ở bất kỳ đâu** — luôn đọc `settings.store_name`. Đổi thương hiệu phải làm được trong 30 giây từ trang admin.
- **Trang `/admin/cai-dat` là điểm bán hàng chính**, không phải phần phụ. Nó cần 5 bộ màu dựng sẵn và xem trước realtime — xem `PLAN.md` mục 0.1.

## Quy trình làm việc
1. **Làm theo phase trong `PLAN.md` mục 7. Không nhảy cóc, không gộp 2 phase.**
2. Trước khi code một phase: liệt kê ngắn gọn các file sẽ tạo/sửa cho An duyệt.
3. Xong phase: `npm run dev`, báo cáo đã làm gì, **mời An mở `localhost:3000` kiểm tra**.
4. An duyệt xong → `git commit` message `feat(phase-N): ...`.
5. Chưa rõ điều gì → **hỏi An, không tự quyết** (nhất là màu, font, phạm vi, và mọi thứ động tới database).

## Điều quan trọng nhất phải nhớ
**Bạn không nhìn thấy giao diện đã render.** Không tự đánh giá được "đẹp", "hiện đại", "mượt".
- Bạn chịu trách nhiệm: code chạy, build sạch, không lỗi TS, đúng đặc tả kỹ thuật.
- An chịu trách nhiệm duyệt thẩm mỹ.
- **Không bao giờ tự tuyên bố giao diện đã đẹp hay đã hoàn thiện về mặt thị giác.**

---

## SUPABASE — đọc kỹ, sai ở đây là mất dữ liệu

Project: `123an-clound's Project` · ref **`xsspvdgnhelzprcqaiek`** · Singapore
URL: `https://xsspvdgnhelzprcqaiek.supabase.co`

**Database đã dựng xong và đã có 24 sản phẩm.** Không tạo lại bảng, không seed lại.

### ⚠️ Ba điều tuyệt đối
1. **Chỉ đụng bảng có tiền tố `veloce_`.** Project này còn chứa dữ liệu của dự án khác (`bakery`, `kho_iphone`, `menu_items`, `categories`, `admin_users`). Đụng nhầm là hỏng dự án của người khác.
2. **Không bao giờ đưa `service_role` key vào code ứng dụng.** Chỉ dùng `anon` / publishable key trong `NEXT_PUBLIC_*`. Key `service_role` bỏ qua toàn bộ RLS.
3. **Không chuyển `private.veloce_is_admin()` sang schema `public`.** Nó nằm ở `private` cố ý để Supabase không sinh endpoint RPC công khai.

### Bảng & hàm
`veloce_categories` (5) · `veloce_products` (24) · `veloce_settings` (1 dòng, id=1) · `veloce_admins` · `veloce_testimonials` (6) · `veloce_orders`
RPC: `veloce_place_order(...)` · `veloce_cancel_order(uuid)` — xem mục "Đặt hàng & tồn kho" bên dưới
Storage bucket: **`veloce`** — `products/{slug}-{1|2|3}.jpg`, `branding/logo.png`, `branding/hero.jpg`

### Thư viện & client
- Dùng **`@supabase/ssr`**. ❌ Không dùng `@supabase/auth-helpers-nextjs` (đã ngừng phát triển).
- `lib/supabase/client.ts` → Client Component · `server.ts` → RSC/Server Action (**tạo mới mỗi request**) · `middleware.ts` → refresh session + chặn `/admin`.
- Type bảng lấy từ `src/types/database.ts` **sinh tự động**:
  `npx supabase gen types typescript --project-id xsspvdgnhelzprcqaiek > src/types/database.ts`
  Chạy lại mỗi khi đổi schema. **Không viết tay type của bảng.**

### Đặt hàng & tồn kho — CHỈ QUA RPC
Tồn kho tự trừ khi đặt, hết hàng thì chặn mua. Database đã có sẵn 2 hàm, **đã kiểm thử**:

- **`veloce_place_order(...)`** — con đường **duy nhất** tạo đơn. Chạy trong một transaction, khóa hàng bằng `for update`, kiểm tra tồn kho và size, tính tiền hoàn toàn từ dữ liệu server, lưu bản chụp giá lúc đặt, sinh mã `VLC-XXXXXX`.
- **`veloce_cancel_order(uuid)`** — hủy đơn và hoàn kho. Chỉ admin gọi được.

❌ **Không `insert` thẳng vào `veloce_orders`.** ❌ **Không tự `update` cột `stock` từ luồng mua hàng.**
Lỗi hàm ném ra đã là **tiếng Việt viết cho người dùng đọc** (`Sản phẩm "X" chỉ còn 4 đôi`) — hiển thị nguyên văn `error.message`, đừng thay bằng "Có lỗi xảy ra".

⚠️ Supabase advisor sẽ báo `veloce_place_order` là SECURITY DEFINER mà anon gọi được. **Đó là chủ ý và bắt buộc** — đừng revoke execute, sẽ hỏng chức năng đặt hàng.

### Sau mỗi thao tác ghi trong admin
Gọi `revalidatePath()` / `revalidateTag()` đúng đường dẫn bị ảnh hưởng. Bỏ bước này → admin sửa xong mà trang ngoài vẫn hiện dữ liệu cũ. Đổi màu / tên cửa hàng phải `revalidatePath("/", "layout")`.

### Bảo mật
- **RLS là lớp chặn cuối, không phải lớp duy nhất.** Mọi Server Action tự kiểm tra quyền admin trước khi ghi.
- Validate bằng `zod` ở **cả** client và Server Action.
- Giá lưu `bigint` đơn vị đồng. **Không dùng số thực.**
- Đơn hàng lưu **bản chụp** tên + giá lúc đặt, không phải khoá ngoại tới sản phẩm.

---

## MÀU — kiến trúc hai tầng, đây là chỗ dễ làm sai nhất

Admin đổi được 3 màu neon từ trang quản trị. Nhưng `@theme` của Tailwind v4 là **build-time**.

**Tầng tĩnh** (nền, chữ, viền) → `@theme` bình thường:
```
ink-950 #07060d · ink-900 #0d0b18 · ink-800 #151226 · ink-700 #1f1a35
fg #f4f2ff · fg-muted #a5a0c0 · fg-subtle #6b6690 · neon-lime #a3e635 (chỉ cho badge)
```

**Tầng thương hiệu** (3 màu neon) → **`@theme inline`** trỏ tới CSS variable:
```css
:root { --brand-primary:#8b5cf6; --brand-secondary:#d946ef; --brand-accent:#22d3ee; }
@theme inline {
  --color-brand:   var(--brand-primary);
  --color-brand-2: var(--brand-secondary);
  --color-brand-3: var(--brand-accent);
}
```
`layout.tsx` đọc `veloce_settings` rồi bơm `<style>:root{--brand-primary:…}</style>`.

⚠️ **Thiếu từ khoá `inline` là hỏng cả tính năng.** Không có nó, Tailwind resolve ra hex cứng lúc build và admin đổi màu sẽ không có tác dụng gì.

- **Không hardcode mã hex trong component.** Luôn dùng token Tailwind.
- Gradient và shadow cũng phải dùng `var(--brand-*)`.
- Nền luôn tối. Màu thương hiệu là điểm nhấn, **không quá 20% màn hình**.
- Không đặt chữ neon lên nền neon. Contrast ≥ 4.5:1 cho chữ < 18px.
- `/admin/cai-dat` **phải cảnh báo** khi màu vừa chọn có contrast với `#07060d` dưới 3:1.

## Font — chốt cứng, chỉ 2 font
- Display: **Space Grotesk** — `next/font/google`, biến `--font-space-grotesk`
- Body: **Inter** — `next/font/google`, biến `--font-inter`
- ❌ Không Clash Display, không font Fontshare, không tự host, không font thứ ba.

## Animation (chỉ storefront — KHÔNG áp dụng cho `/admin`)
- Easing chuẩn toàn site: **`[0.22, 1, 0.36, 1]`**.
- Thư viện: gói **`motion`** (import từ `motion/react`) — **KHÔNG phải `framer-motion`**, gói đã đổi tên.
- GSAP + ScrollTrigger chỉ cho pin/scrub. Lenis lo smooth scroll.
- **Chỉ animate `transform` và `opacity`.** Cấm animate `width`, `height`, `top`, `left`, `box-shadow` trong vòng lặp.
- Hiệu ứng nặng (cursor, spotlight, tilt, aurora) chỉ bật khi `matchMedia("(pointer: fine)")`.
- Luôn tôn trọng `prefers-reduced-motion: reduce`.
- **Khu `/admin` ưu tiên rõ ràng và nhanh, không phải đẹp:** không custom cursor, không smooth scroll, không aurora, không page transition. Giữ nền tối và font cho đồng bộ, hết.

## Ảnh
- Ảnh sản phẩm nằm trên **Supabase Storage**, không nằm trong `public/`.
- Thêm `xsspvdgnhelzprcqaiek.supabase.co` vào `images.remotePatterns` trong `next.config.ts`.
- Dùng `next/image` mọi nơi. Hero `priority`, còn lại lazy. Mọi ảnh có `sizes` + container `aspect-ratio`.
- `npm run gen:images` tải ảnh Unsplash → cắt 3 khung → upload Storage → cập nhật cột `images`.
- ⚠️ Trước khi deploy công khai: xem lại bucket, thay ảnh nào lộ logo thương hiệu (giấy phép Unsplash không cấp quyền nhãn hiệu trong ảnh).

## Code
- TypeScript `strict`, **không dùng `any`**.
- Component > 200 dòng → tách nhỏ.
- Component `PascalCase.tsx`, lib `camelCase.ts`.
- Gộp class bằng `cn()` trong `src/lib/cn.ts` (clsx + tailwind-merge).
- Mặc định Server Component. Chỉ `"use client"` khi thật sự cần state/effect/animation.
- Comment tiếng Việt cho logic hiệu ứng phức tạp và mọi chỗ đụng RLS.
- Trạng thái đủ: default / hover / focus / active / disabled / loading / empty / error.

## Cấm
- ❌ UI kit dựng sẵn (MUI, Ant Design, Chakra, Bootstrap, shadcn)
- ❌ Three.js / WebGL ở giai đoạn này
- ❌ `tailwind.config.js` kiểu v3
- ❌ Lorem ipsum — mọi chữ hiển thị phải là tiếng Việt có nghĩa
- ❌ Thanh toán thật (chỉ mô phỏng, ghi rõ là demo)
- ❌ Đổi package manager giữa chừng — dùng **npm**
- ❌ Giao diện tự thêm admin mới trong trang quản trị (làm bằng SQL, xem PLAN.md mục 4.5)
- ❌ Hardcode chuỗi "VELOCE" — luôn đọc `settings.store_name`
- ❌ Insert thẳng vào `veloce_orders` hoặc tự update cột `stock`

## Lệnh hay dùng
```bash
npm run dev          # phát triển
npm run build        # phải sạch, không warning TS, trước khi báo xong phase
npm run gen:images   # tải + cắt + upload 72 ảnh sản phẩm lên Storage
npx supabase gen types typescript --project-id xsspvdgnhelzprcqaiek > src/types/database.ts
```

## Nguyên tắc cuối
**Đẹp nhưng phải đọc được. Không giật. Nhất quán.**
Thà bỏ một hiệu ứng còn hơn để trang tụt khung hình hoặc che mất giá sản phẩm.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
