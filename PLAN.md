# KẾ HOẠCH DỰ ÁN — VELOCE / Website bán giày nam + trang quản trị

> **File này là bản đặc tả (spec) để đưa cho Claude Code thực thi.**
> Đọc hết file **và `CLAUDE.md`** trước khi viết dòng code đầu tiên. Mọi quyết định đã được chốt ở đây — **không hỏi lại, không tự đổi stack, không tự đổi bảng màu**. Nếu có điểm mâu thuẫn, ưu tiên mục 9 "Nguyên tắc bất di bất dịch".
>
> **Cơ sở dữ liệu đã dựng xong và có dữ liệu thật.** Xem mục 4 — không phải tạo lại.

---

## 0. TÓM TẮT 1 PHÚT

| Hạng mục | Chốt |
|---|---|
| Tên thương hiệu | **VELOCE** — ⚠️ **tên tạm**, xem mục 0.1 |
| Loại sản phẩm | Storefront thương mại điện tử + **trang quản trị đầy đủ quyền** |
| Mục đích | **Sản phẩm mẫu để demo và bán cho chủ shop giày** — xem mục 0.1 |
| Tech stack | Next.js 16 LTS (App Router) + TypeScript + Tailwind CSS v4 |
| Dữ liệu | **Supabase** (Postgres + Auth + Storage) — đã dựng sẵn, đã seed 24 sản phẩm |
| Project Supabase | `123an-clound's Project` · ref `xsspvdgnhelzprcqaiek` · Singapore |
| Phong cách | Dark neon + Glassmorphism (nền tối, gradient tím–hồng–cyan phát sáng, kính mờ) |
| Màu chủ đạo | **Admin đổi được lúc chạy** — xem mục 2.1, đây là ràng buộc kiến trúc |
| Hiệu ứng | Mạnh nhưng có kiểm soát: Motion + GSAP ScrollTrigger + Lenis |
| Ngôn ngữ UI | Tiếng Việt, giá VND |
| Mục tiêu đo được | Lighthouse Performance ≥ 85, Accessibility ≥ 95, responsive 360px → 2560px |

**Định vị thẩm mỹ:** giao diện phải gây cảm giác "wow" ngay 3 giây đầu — như một concept store công nghệ cao, không phải một shop bán hàng thông thường. Nhưng "wow" không được đánh đổi bằng scroll giật, layout shift, hay chữ khó đọc.

---

## 0.1 ĐÂY LÀ SẢN PHẨM MẪU ĐỂ BÁN — ĐIỀU NÀY ĐỔI THỨ TỰ ƯU TIÊN

An sẽ dùng dự án này làm **demo thuyết phục chủ shop giày**, rồi tùy biến lại cho từng khách. Ba hệ quả:

**1) Trang quản trị là điểm bán hàng, không phải phần phụ.**
Cái làm chủ shop gật đầu không phải hiệu ứng đẹp — mà là khoảnh khắc họ thấy **chính họ đổi được tên, khẩu hiệu, logo và màu cửa hàng trong 30 giây mà không cần lập trình viên**. Vì vậy `/admin/cai-dat` phải mượt và dễ hiểu hơn mức "chạy được":
- **5 bộ màu dựng sẵn** bấm một phát là đổi cả site (hardcode trong component, không cần bảng mới): Tím–Cyan (mặc định), Cam–Hồng, Xanh lá–Vàng chanh, Xanh dương–Bạc, Đỏ–Vàng đồng.
- Xem trước **ngay lập tức** trước khi bấm Lưu — đây là màn demo, không được reload mới thấy.
- Đổi tên cửa hàng phải ăn ngay ở header, footer, tab trình duyệt và hero.

**2) Tên "VELOCE" là TÊN TẠM.** An chưa chốt tên. Nó hiện nằm ở 3 chỗ:
- `veloce_settings.store_name` — đổi từ trang admin, 2 giây
- Cột `brand` của 24 sản phẩm — một câu `UPDATE`
- **Tiền tố bảng `veloce_`** — cái này *không* đổi, và cũng không cần đổi: người dùng không bao giờ nhìn thấy tên bảng

→ **Không hardcode chuỗi "VELOCE" ở bất kỳ đâu trong code.** Luôn đọc từ `settings.store_name`. Đây là điều kiện để đổi thương hiệu trong 30 giây.

**3) Bán cho khách = dùng thương mại = phải rà ảnh.** Giấy phép Unsplash cho dùng ảnh thương mại nhưng **không cấp quyền với nhãn hiệu xuất hiện trong ảnh**. Một số ảnh sneaker có logo hiện rõ. Demo cho chủ shop mà trong đó "sản phẩm của họ" là đôi Nike thì vừa kém chuyên nghiệp vừa rủi ro. **Việc này thành bắt buộc ở Phase 8**, không còn là tùy chọn.

---

## 1. TECH STACK (CHỐT — KHÔNG THAY ĐỔI)

### Bắt buộc
```
next@16            App Router, Server Components mặc định — 16.x là bản LTS (8/2026)
react@19
typescript@5       strict: true
tailwindcss@4      cấu hình bằng @theme trong CSS, KHÔNG dùng tailwind.config.js kiểu v3

@supabase/supabase-js@2   client Postgres + Auth + Storage
@supabase/ssr             quản lý session qua cookie cho App Router (KHÔNG dùng
                          auth-helpers-nextjs — package đó đã ngừng phát triển)

motion@12          THƯ VIỆN CŨ TÊN "framer-motion", nay đổi tên gói thành `motion`.
                   Cài `npm i motion`, import từ `motion/react` (KHÔNG phải "framer-motion").
gsap@3             + ScrollTrigger — dành riêng cho hiệu ứng cuộn phức tạp
lenis              smooth scroll
lucide-react       icon set duy nhất
clsx + tailwind-merge  gộp class (viết helper `cn()`)
zustand@5          state giỏ hàng + persist vào localStorage
react-hook-form + zod  form đặt hàng và toàn bộ form trong trang admin
sonner             toast thông báo
```

> **Trước khi cài:** chạy `npm view next version` / `npm view motion version` để lấy bản ổn định mới nhất tại thời điểm chạy, thay vì hardcode số phiên bản trong file này. Các số ở trên là mốc tối thiểu (tính tới 08/2026).

### Được phép thêm nếu cần
- `embla-carousel-react` — carousel sản phẩm
- `sharp` + `tsx` — script xử lý và tải ảnh lên Storage (dev dependency)
- `next/font` — load font (KHÔNG dùng thẻ `<link>` tới Google Fonts)

### Cấm
- ❌ Không dùng UI kit dựng sẵn (MUI, Ant Design, Chakra, Bootstrap, shadcn) — làm mất chất riêng
- ❌ Không Three.js / WebGL ở phase này (đã cân nhắc, loại vì nặng)
- ❌ Không `tailwind.config.js` kiểu cũ — Tailwind v4 khai báo theme trong CSS
- ❌ **Không bao giờ đưa `service_role` key vào code ứng dụng.** Chỉ dùng `anon` / publishable key. Key `service_role` bỏ qua toàn bộ RLS — lộ ra là mất sạch dữ liệu.
- ❌ Không dùng `@supabase/auth-helpers-nextjs` (đã ngừng phát triển) — dùng `@supabase/ssr`

### Khởi tạo
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Biến môi trường (`.env.local` — thêm vào `.gitignore`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xsspvdgnhelzprcqaiek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1i_JXF8ar4zT9eCrRdch0A_9TG-UhaP
```
Hai giá trị này **an toàn khi lộ ra trình duyệt** — đó là thiết kế của Supabase. Lớp bảo vệ thật nằm ở RLS (mục 4.3), không nằm ở việc giấu key.

---

## 2. DESIGN SYSTEM

### 2.1 Bảng màu — kiến trúc hai tầng (ĐỌC KỸ, ĐÂY LÀ ĐIỂM DỄ LÀM SAI NHẤT)

**Vấn đề:** admin phải đổi được 3 màu neon chủ đạo từ trang quản trị. Nhưng `@theme` của Tailwind v4 là **build-time** — nó biên dịch một lần lúc `npm run build`, không đọc được từ database lúc chạy.

**Cách giải — chia màu làm hai tầng:**

**Tầng 1 — màu tĩnh** (nền, chữ, viền): khai báo bình thường trong `@theme`, không ai đổi được.

**Tầng 2 — màu thương hiệu** (3 màu neon): khai báo bằng `@theme inline` trỏ tới CSS variable, giá trị thật do server bơm vào lúc render.

```css
/* src/app/globals.css */
@import "tailwindcss";

/* Giá trị dự phòng — bị ghi đè bởi thẻ <style> mà layout.tsx bơm vào */
:root {
  --brand-primary:   #8b5cf6;   /* violet */
  --brand-secondary: #d946ef;   /* fuchsia */
  --brand-accent:    #22d3ee;   /* cyan */
}

/* ⚠️ BẮT BUỘC dùng `@theme inline` cho tầng này.
   Không có từ khoá `inline`, Tailwind sẽ resolve ra mã hex ngay lúc build,
   và `bg-brand` biên dịch thành `background-color: #8b5cf6` cứng đờ —
   admin đổi màu sẽ không có tác dụng gì.
   Có `inline`, utility sinh ra `background-color: var(--brand-primary)`
   nên đổi biến lúc chạy là đổi luôn giao diện. */
@theme inline {
  --color-brand:   var(--brand-primary);
  --color-brand-2: var(--brand-secondary);
  --color-brand-3: var(--brand-accent);
}

@theme {
  /* Nền — tối, hơi ngả tím, KHÔNG dùng #000 thuần */
  --color-ink-950: #07060d;   /* nền trang */
  --color-ink-900: #0d0b18;   /* nền section xen kẽ */
  --color-ink-800: #151226;   /* nền card đặc */
  --color-ink-700: #1f1a35;   /* border, divider */

  /* Chữ */
  --color-fg:        #f4f2ff;
  --color-fg-muted:  #a5a0c0;
  --color-fg-subtle: #6b6690;

  /* Điểm nhấn cố định — không cho admin đổi */
  --color-neon-lime: #a3e635;  /* chỉ dùng cho badge "SALE" / "NEW" */

  /* Font — do next/font sinh ra, xem mục 2.2 */
  --font-display: var(--font-space-grotesk), system-ui, sans-serif;
  --font-body:    var(--font-inter), system-ui, sans-serif;

  /* Bo góc & shadow */
  --radius-card: 20px;
}
```

**Bơm màu vào trong `layout.tsx`** (Server Component, đọc từ Supabase):
```tsx
const s = await getSettings();   // cache theo tag "settings"

<style dangerouslySetInnerHTML={{ __html: `:root{
  --brand-primary:${s.color_primary};
  --brand-secondary:${s.color_secondary};
  --brand-accent:${s.color_accent};
}` }} />
```

**Gradient và shadow cũng phải dùng biến**, không hardcode hex:
```css
--gradient-aurora: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 45%, var(--brand-accent) 100%);
--shadow-glow: 0 0 40px -8px color-mix(in oklab, var(--brand-primary) 55%, transparent);
```

**Quy tắc dùng màu:**
- Nền luôn tối. Màu thương hiệu chỉ dùng làm **điểm nhấn**, không quá 20% diện tích màn hình.
- Chữ body luôn `text-fg` hoặc `text-fg-muted`. **Không bao giờ** đặt chữ neon lên nền neon.
- ⚠️ Admin có thể chọn màu sáng làm brand color, khiến chữ trắng đè lên mất đọc. Trang `/admin/cai-dat` **phải cảnh báo** khi độ tương phản của màu vừa chọn với nền `#07060d` xuống dưới 3:1.

### 2.2 Typography
- **Display / heading:** **Space Grotesk** — chốt duy nhất, load qua `next/font/google` với `variable: "--font-space-grotesk"`. **Không dùng Clash Display hay bất kỳ font Fontshare nào** (không có trên Google Fonts, phải tự host, rủi ro không đáng). Weight 500/700, `letter-spacing: -0.03em`, heading lớn dùng `clamp()`.
- **Body:** **Inter** — `next/font/google`, `variable: "--font-inter"`, weight 400/500/600.
- Gắn cả hai biến vào `<html className={...}>` trong `layout.tsx`. Toàn site chỉ có **2 font này**.
- Thang chữ: `clamp(2.5rem, 8vw, 7rem)` cho H1 hero; H2 `clamp(2rem, 5vw, 4rem)`; body 16px, muted 14px.
- Số (giá tiền) dùng `font-variant-numeric: tabular-nums`.

### 2.3 Chất liệu bề mặt (signature của dự án)
Ba utility class dùng lại toàn site, khai báo trong `globals.css`:

1. **`.glass`** — kính mờ:
   `background: linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.02)); backdrop-filter: blur(16px) saturate(140%); border: 1px solid rgba(255,255,255,.10);`
2. **`.glow-border`** — viền gradient chạy sáng: dùng `::before` với `padding:1px`, `background: var(--gradient-aurora)`, `mask-composite: exclude`. Khi hover thì gradient **xoay** (animate biến `--angle` qua `@property`).
3. **`.noise`** — lớp nhiễu hạt phủ toàn trang: `::after` với SVG `feTurbulence` inline data-URI, `opacity: .035`, `mix-blend-mode: overlay`, `pointer-events: none`. Đây là chi tiết khiến giao diện trông "đắt" — bắt buộc có.

### 2.4 Họa tiết nền — bắt buộc, làm nên độ "sinh động"
- **Aurora blobs:** 2–3 hình tròn gradient blur cực lớn (`blur(120px)`) dùng `var(--brand-*)`, animate trôi chậm 20–30s, `position: fixed`, `z-index: -1`.
- **Grid lines:** lưới mảnh `1px` màu `rgba(255,255,255,.04)`, fade dần về đáy bằng `mask-image`.
- **Conic spotlight theo chuột:** một div theo con trỏ, `radial-gradient` mờ, `mix-blend-mode: soft-light` — chỉ bật trên desktop (`pointer: fine`).

---

## 3. CẤU TRÚC THƯ MỤC

```
shoe-shop/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                  # font, metadata, bơm màu brand, SmoothScroll, Header, Footer
│  │  ├─ page.tsx                    # Trang chủ
│  │  ├─ globals.css                 # @theme + @theme inline + utility
│  │  ├─ san-pham/
│  │  │  ├─ page.tsx                 # Danh sách + bộ lọc
│  │  │  └─ [slug]/page.tsx          # Chi tiết sản phẩm
│  │  ├─ gio-hang/page.tsx
│  │  ├─ thanh-toan/page.tsx
│  │  ├─ ve-chung-toi/page.tsx
│  │  ├─ lien-he/page.tsx
│  │  └─ admin/                      # ⬅ khu quản trị, layout riêng, KHÔNG có hiệu ứng nặng
│  │     ├─ layout.tsx               # kiểm tra đăng nhập + sidebar
│  │     ├─ page.tsx                 # Bảng điều khiển
│  │     ├─ dang-nhap/page.tsx
│  │     ├─ san-pham/
│  │     │  ├─ page.tsx              # bảng danh sách
│  │     │  ├─ moi/page.tsx          # thêm mới
│  │     │  └─ [id]/page.tsx         # sửa
│  │     ├─ danh-muc/page.tsx
│  │     ├─ don-hang/page.tsx
│  │     ├─ danh-gia/page.tsx
│  │     └─ cai-dat/page.tsx         # tên, khẩu hiệu, MÀU, logo, hero, liên hệ, coupon
│  ├─ components/
│  │  ├─ layout/    Header.tsx, Footer.tsx, MobileMenu.tsx, CartDrawer.tsx
│  │  ├─ home/      Hero.tsx, Marquee.tsx, FeaturedGrid.tsx, CategoryShowcase.tsx,
│  │  │             ScrollStory.tsx, Stats.tsx, Testimonials.tsx, Newsletter.tsx
│  │  ├─ product/   ProductCard.tsx, ProductGrid.tsx, FilterBar.tsx, Gallery.tsx,
│  │  │             SizePicker.tsx, ColorPicker.tsx, SizeGuide.tsx, AddToCartBar.tsx
│  │  ├─ admin/     AdminSidebar.tsx, DataTable.tsx, ProductForm.tsx, ImageUploader.tsx,
│  │  │             ColorPickerField.tsx, ContrastWarning.tsx, StatCard.tsx
│  │  ├─ ui/        Button.tsx, Badge.tsx, Input.tsx, Skeleton.tsx, Reveal.tsx,
│  │  │             MagneticButton.tsx, TiltCard.tsx, CountUp.tsx, Drawer.tsx
│  │  └─ fx/        SmoothScroll.tsx, CustomCursor.tsx, AuroraBackground.tsx,
│  │                NoiseOverlay.tsx, SpotlightCursor.tsx, PageTransition.tsx
│  ├─ lib/
│  │  ├─ supabase/  client.ts (browser), server.ts (RSC/action), middleware.ts
│  │  ├─ queries/   products.ts, categories.ts, settings.ts, orders.ts, testimonials.ts
│  │  ├─ cn.ts, format.ts (định dạng VND), contrast.ts (kiểm tra tương phản màu)
│  ├─ store/        cart.ts (zustand + persist)
│  └─ types/        database.ts (SINH TỰ ĐỘNG), index.ts
├─ supabase/
│  └─ migrations/                    # bản sao SQL đã áp — để đối chiếu, xem mục 4
├─ scripts/
│  └─ upload-images.mjs              # tải ảnh Unsplash → cắt 3 khung → lên Supabase Storage
├─ middleware.ts                     # refresh session + chặn /admin khi chưa đăng nhập
├─ _seed/                            # tài liệu mồi — đọc rồi XÓA thư mục này
├─ CLAUDE.md                         # quy ước bắt buộc — Claude Code tự đọc mỗi phiên
├─ PLAN.md                           # file này
└─ README.md
```

---

## 4. CƠ SỞ DỮ LIỆU — ĐÃ DỰNG XONG, ĐÃ CÓ DỮ LIỆU

> **Không phải chạy migration, không phải seed.** Toàn bộ bảng, RLS, Storage bucket và dữ liệu đã được tạo sẵn trên Supabase ngày 25/08/2026. Bản sao SQL nằm trong `supabase/migrations/` để đối chiếu.
>
> Project: **`123an-clound's Project`** · ref `xsspvdgnhelzprcqaiek` · vùng Singapore (ap-southeast-1)
>
> ⚠️ Project này **còn chứa dữ liệu của các dự án khác** (bakery, kho_iphone, menu_items…). Vì vậy mọi bảng của dự án này đều mang tiền tố **`veloce_`**. **Tuyệt đối không đụng vào bảng nào không có tiền tố đó.**

### 4.1 Các bảng

| Bảng | Nội dung | Đã có |
|---|---|---|
| `veloce_categories` | 5 danh mục: sneaker, the-thao, giay-da, loafer, boot | 5 dòng |
| `veloce_products` | Sản phẩm | **24 dòng** |
| `veloce_settings` | Cài đặt cửa hàng — **chỉ 1 dòng, id = 1** | 1 dòng |
| `veloce_admins` | Ai được vào trang admin (khoá ngoại tới `auth.users`) | **0 dòng — xem 4.5** |
| `veloce_testimonials` | Đánh giá khách hàng hiển thị trang chủ | 6 dòng |
| `veloce_orders` | Đơn hàng | 0 dòng |

**Cột chính của `veloce_products`:**
`id` (uuid), `slug` (unique), `name`, `brand`, `category_id` → `veloce_categories`, `price` (bigint, VND), `original_price` (nullable), `description`, `features` (text[]), `sizes` (int[]), `colors` (jsonb `[{name,hex}]`), `images` (text[] — URL công khai trên Storage), `unsplash_id`, `rating` (numeric 2,1), `review_count`, `badge` (`NEW|SALE|HOT|LIMITED`, nullable), `stock`, `is_published`, `sort_order`, `created_at`, `updated_at`.

**Cột chính của `veloce_settings`:**
`store_name`, `slogan`, `hero_headline`, `hero_subheadline`, `logo_url`, `hero_image_url`, `color_primary`, `color_secondary`, `color_accent`, `phone`, `email`, `address`, `facebook_url`, `instagram_url`, `zalo_url`, `coupon_code`, `coupon_percent`, `freeship_threshold` (mặc định 1.000.000₫).

> `images` của 24 sản phẩm hiện là **mảng rỗng** — chạy script ở mục 4.4 để đổ đầy.

### 4.2 Storage
Bucket **`veloce`** — công khai đọc, giới hạn 5MB/file, chỉ nhận ảnh. Quy ước đường dẫn:
```
products/{slug}-1.jpg   products/{slug}-2.jpg   products/{slug}-3.jpg
branding/logo.png       branding/hero.jpg
```

### 4.3 RLS — bảo mật nằm ở đây, không nằm ở việc giấu key

| Vai trò | Đọc | Ghi |
|---|---|---|
| **anon** (khách vãng lai) | sản phẩm/đánh giá **đã publish**, danh mục, cài đặt | **chỉ** `insert` vào `veloce_orders` |
| **authenticated** không phải admin | như anon | không gì cả |
| **admin** (có dòng trong `veloce_admins`) | tất cả | tất cả, kể cả Storage |

Hàm kiểm tra quyền là `private.veloce_is_admin()`. Nó nằm trong schema `private` **cố ý** — schema này không nằm trong Exposed schemas nên Supabase không sinh endpoint `/rest/v1/rpc/...` cho nó, trong khi RLS policy vẫn gọi được bình thường. **Không chuyển hàm này sang schema `public`.**

Đã chạy Supabase security advisor sau khi dựng: **không còn cảnh báo nào thuộc về dự án này.**

### 4.4 Ảnh sản phẩm — tải một lần rồi lên Storage

Kho ảnh stock không có 3 góc chụp của *cùng một* đôi giày. Ghép 3 ảnh khác nhau thì gallery lộ ngay là 3 đôi khác nhau. Cách giải: mỗi sản phẩm có **một ảnh gốc Unsplash** (cột `unsplash_id`, giấy phép cho phép dùng thương mại), script cắt thành **3 khung**:

| File | Khung | Xử lý |
|---|---|---|
| `{slug}-1.jpg` | Toàn cảnh | Ảnh gốc `fit: inside` đặt giữa nền gradient neon |
| `{slug}-2.jpg` | Cận chi tiết | Cắt giữa, phóng 1.8×, tăng saturation 8% |
| `{slug}-3.jpg` | Góc nghiêng | Xoay −9°, backdrop đậm hơn, giảm sáng 3% |

```bash
npm i -D sharp tsx
npm run gen:images     # tải → cắt → upload Storage → cập nhật cột images
```
Script cần đăng nhập bằng tài khoản admin (RLS chặn ghi Storage với anon). Chi tiết trong `_seed/README.md`.

⚠️ **Trước khi deploy công khai:** giấy phép Unsplash cho phép dùng ảnh thương mại nhưng **không cấp quyền với nhãn hiệu xuất hiện trong ảnh**. Một số ảnh sneaker có logo hiện rõ. Xem qua bucket, thay ảnh nào lộ logo bằng cách sửa `unsplash_id` rồi chạy lại script. Chạy local để học thì bỏ qua.

### 4.5 Tạo tài khoản admin đầu tiên — VIỆC ĐẦU TIÊN PHẢI LÀM

Bảng `veloce_admins` đang rỗng, nghĩa là **chưa ai vào được trang quản trị**. Đây là chủ ý: không tự tạo tài khoản để tránh mật khẩu mặc định nằm trong file kế hoạch.

An làm 2 bước sau trên Supabase Dashboard:

1. **Authentication → Users → Add user** → nhập email và mật khẩu tự chọn → tick *Auto Confirm User*.
2. **SQL Editor** → chạy:
   ```sql
   insert into public.veloce_admins (user_id, email, full_name)
   select id, email, 'Phạm Tuấn An' from auth.users where email = 'EMAIL_VUA_TAO'
   on conflict (user_id) do nothing;
   ```

Muốn thêm admin khác sau này thì lặp lại 2 bước trên. **Cố ý không có giao diện tự thêm admin trong trang quản trị** — thêm quyền cao nhất mà chỉ cần một form thì rủi ro quá lớn so với lợi ích.

### 4.6 Sinh type TypeScript từ database
```bash
npx supabase gen types typescript --project-id xsspvdgnhelzprcqaiek > src/types/database.ts
```
**Chạy lại mỗi khi đổi schema.** Không viết tay type của bảng — sai một chữ là lỗi âm thầm lúc chạy.

### 4.7 Ba client Supabase — dùng đúng chỗ
| File | Dùng ở | Lưu ý |
|---|---|---|
| `lib/supabase/client.ts` | Client Component | `createBrowserClient` từ `@supabase/ssr` |
| `lib/supabase/server.ts` | Server Component, Server Action, Route Handler | `createServerClient` + `cookies()`. **Tạo mới mỗi request**, không đưa ra biến toàn cục |
| `lib/supabase/middleware.ts` | `middleware.ts` ở gốc | Refresh session và chặn `/admin` khi chưa đăng nhập |

### 4.8 Đặt hàng và tồn kho — DÙNG RPC, KHÔNG insert thẳng

Tồn kho **tự trừ khi khách đặt**, và **hết hàng thì chặn mua**.

Việc này **không làm bằng nhiều query rời từ client được**. Hai khách bấm mua cùng lúc đôi cuối cùng sẽ cùng đọc thấy `stock = 1` và cùng đặt thành công — bán vượt số lượng. Vì vậy database đã có sẵn hai hàm, **đã kiểm thử thật**:

#### `veloce_place_order(...)` — con đường DUY NHẤT để tạo đơn
```ts
const { data, error } = await supabase.rpc("veloce_place_order", {
  p_customer_name:  form.name,
  p_customer_phone: form.phone,
  p_address:        form.address,
  p_items: cart.map(i => ({
    product_id: i.productId, size: i.size, color: i.color, quantity: i.quantity,
  })),
  p_customer_email: form.email ?? null,
  p_note:           form.note ?? null,
  p_coupon_code:    form.coupon ?? null,
});
// data[0] = { order_id, order_code, order_total }
```

Hàm này chạy trong **một transaction**, khóa từng hàng sản phẩm bằng `for update`, rồi:
- Từ chối nếu sản phẩm không tồn tại, đã ngừng bán, hoặc **không đủ tồn kho** (báo còn đúng bao nhiêu đôi)
- Từ chối size không có trong `sizes` của sản phẩm
- Giới hạn 20 dòng/đơn, 1–10 đôi mỗi dòng
- **Tính tiền hoàn toàn từ dữ liệu server** — giá, mã giảm giá, ngưỡng freeship, phí ship đều đọc từ database. Client gửi lên giá bao nhiêu cũng bị bỏ qua.
- Lưu **bản chụp** tên + giá lúc đặt vào `items`
- Sinh mã đơn `VLC-XXXXXX` không trùng

⚠️ **Không bao giờ `insert` thẳng vào `veloce_orders` từ ứng dụng.** Làm vậy là bỏ qua toàn bộ kiểm tra ở trên và tồn kho sẽ sai.

⚠️ Lỗi ném ra từ hàm này là **tiếng Việt đã viết sẵn cho người dùng đọc** (ví dụ `Sản phẩm "Meridian Wholecut" chỉ còn 4 đôi`). Hiển thị nguyên văn `error.message` lên toast, đừng thay bằng "Có lỗi xảy ra".

#### `veloce_cancel_order(p_order_id uuid)` — hủy đơn và hoàn kho
Chỉ admin gọi được. Từ chối hủy đơn đã `done` hoặc đã `cancelled`.

Ở giao diện: sản phẩm `stock = 0` thì nút "Thêm vào giỏ" bị khóa và hiện "Tạm hết hàng"; `stock <= 5` thì hiện "Chỉ còn N đôi" — vừa trung thực vừa tạo cảm giác khan hiếm.

#### Về cảnh báo của Supabase advisor
Advisor sẽ báo `veloce_place_order` là `SECURITY DEFINER` mà `anon` gọi được. **Đây là chủ ý và bắt buộc** — khách vãng lai không có quyền `update` bảng sản phẩm, nhưng đặt hàng thì phải trừ kho. Hàm này là con đường được kiểm soát duy nhất. **Đừng "sửa" bằng cách revoke execute** — làm vậy là hỏng chức năng đặt hàng.

### 4.9 Làm mới cache sau khi admin sửa dữ liệu
Trang công khai đọc dữ liệu qua Server Component có cache. Sau **mỗi** thao tác ghi trong trang admin, Server Action phải gọi `revalidatePath()` hoặc `revalidateTag()` cho đúng đường dẫn bị ảnh hưởng. Bỏ bước này thì admin sửa xong mà trang ngoài vẫn hiện dữ liệu cũ — lỗi này rất hay gặp và rất khó nhận ra.

Đổi màu / tên cửa hàng thì phải `revalidatePath("/", "layout")` vì chúng nằm trong layout gốc.

---

## 5. ĐẶC TẢ TỪNG TRANG

### 5.1 Trang chủ `/` — quan trọng nhất, dồn 50% công sức vào đây

**1) Hero (100vh)** — nền aurora + grid + noise. Tiêu đề (lấy từ `settings.hero_headline`) tách theo ký tự, bay lên so le (stagger 0.03s). Hai nút: "Khám phá bộ sưu tập" (gradient, magnetic) và "Xem sản phẩm mới". Ảnh giày lớn bên phải: floating ±12px/4s + parallax theo chuột (±20px) + glow phía sau. Góc dưới có chỉ báo cuộn. **Toàn bộ animation vào trang xong trong 1.2s, không chặn LCP.**

**2) Marquee thương hiệu** — 2 hàng chạy ngược chiều, chậm lại khi hover.

**3) Danh mục nổi bật** — 5 thẻ từ `veloce_categories`, hover thì ảnh zoom 1.08 + overlay sáng lên + tên trượt lên.

**4) Sản phẩm nổi bật** — 8 sản phẩm `is_published = true` sắp theo `sort_order`, mỗi card reveal so le khi cuộn tới.

**5) ScrollStory** — GSAP ScrollTrigger + pin: giày đứng yên giữa màn hình, 3 khối text lần lượt trôi qua, ảnh đổi/xoay theo tiến độ cuộn. Đây là điểm nhấn "wow" số 2.

**6) Thống kê** — 4 số đếm tăng dần khi vào viewport.

**7) Đánh giá khách hàng** — carousel thẻ kính mờ từ `veloce_testimonials`, tự chạy, dừng khi hover.

**8) Newsletter** — khối glass lớn, viền gradient xoay, form email validate + toast.

### 5.2 `/san-pham` — Danh sách
- Bộ lọc: danh mục, khoảng giá (slider), size, **màu bằng chấm tròn** (không phải checkbox chữ — xem Phụ lục A3), chỉ hàng sale. Trên mobile là bottom sheet.
- Sắp xếp: mới nhất / giá tăng / giá giảm / đánh giá cao.
- Lấy dữ liệu ở Server Component, lọc client-side bằng `useMemo` (24 sản phẩm thì không cần round-trip).
- Grid dùng `<motion.div layout>` để item mượt khi lọc; có empty state.

### 5.3 `/san-pham/[slug]` — Chi tiết
- Gallery: ảnh lớn + thumbnail dọc; hover zoom theo vị trí chuột (desktop), vuốt trên mobile.
- Chọn màu (từ `colors` jsonb), chọn size (size hết hàng gạch chéo, không bấm được).
- Giá + giá gốc gạch ngang + badge % giảm.
- **Bảng quy đổi size** (dài bàn chân cm → 39–45) — lý do trả hàng số một của giày online là sai size.
- Nút "Thêm vào giỏ" — bấm xong bay vào icon giỏ + toast.
- Tabs: Mô tả / Thông số (`features`) / Đánh giá.
- "Có thể bạn thích" — 4 sản phẩm cùng `category_id`.
- `generateStaticParams` cho toàn bộ slug + `generateMetadata` cho SEO.

### 5.4 `/gio-hang` + CartDrawer
- Drawer trượt từ phải, backdrop blur, item thêm/xóa có `AnimatePresence`.
- **Thanh tiến trình freeship**: "Mua thêm 320.000₫ nữa để được miễn phí vận chuyển" — ngưỡng lấy từ `settings.freeship_threshold`.
- Mã giảm giá đọc từ `settings.coupon_code` / `coupon_percent`.
- Giỏ trống: minh họa + nút quay lại mua sắm.

### 5.5 `/thanh-toan`
- Form 3 bước (Thông tin → Giao hàng → Xác nhận) với thanh tiến trình, `react-hook-form` + `zod`, lỗi bằng tiếng Việt.
- Submit → Server Action gọi **RPC `veloce_place_order`** (mục 4.8). **Không insert thẳng vào `veloce_orders`.**
- Lỗi trả về đã là tiếng Việt cho người dùng — hiển thị nguyên văn (ví dụ khi có người mua mất đôi cuối trong lúc khách đang điền form).
- Tổng tiền hiển thị ở bước xác nhận là **ước tính phía client**; con số thật do server trả về sau khi đặt. Nếu lệch thì tin server.
- Thành công → màn hình có confetti CSS + mã đơn `VLC-XXXXXX`. **Không thanh toán thật.**

### 5.6 `/ve-chung-toi`, `/lien-he`
- Về chúng tôi: timeline dọc có ScrollTrigger, ảnh parallax.
- Liên hệ: thông tin lấy từ `veloce_settings` + form + bản đồ nhúng.

### 5.7 KHU QUẢN TRỊ `/admin` — phần mới, làm sau khi storefront chạy

**Nguyên tắc chung:** trang admin ưu tiên **rõ ràng và nhanh**, không phải đẹp. **Không** custom cursor, **không** smooth scroll, **không** aurora, **không** page transition. Giữ nền tối và font cho đồng bộ, hết. Người dùng ở đây là An đang làm việc, không phải khách đang mua sắm.

| Đường dẫn | Nội dung |
|---|---|
| `/admin/dang-nhap` | Email + mật khẩu qua Supabase Auth. Đăng nhập xong kiểm tra có trong `veloce_admins` không; không có thì đăng xuất ngay và báo "Tài khoản không có quyền quản trị" |
| `/admin` | Bảng điều khiển. **Không có email báo đơn mới** (An chọn tự vào xem), nên chỗ này phải làm việc thay cho thông báo: số **đơn chờ xử lý** in to nhất trang, có chấm đỏ trên mục "Đơn hàng" ở sidebar khi > 0, và ghi rõ "Đơn mới nhất: N phút trước". Kèm tổng sản phẩm, doanh thu 30 ngày, 5 đơn mới nhất, và cảnh báo **sản phẩm sắp hết hàng** (`stock <= 5`) |
| `/admin/san-pham` | Bảng: ảnh nhỏ, tên, danh mục, giá, tồn kho, trạng thái publish. Tìm kiếm theo tên, lọc theo danh mục, bật/tắt publish ngay trên hàng |
| `/admin/san-pham/moi` · `/[id]` | Form đầy đủ: tên (tự sinh slug), danh mục, giá + giá gốc, mô tả, thông số (thêm/xoá từng dòng), size (chọn nhiều 39–45), màu (tên + color picker, thêm/xoá), badge, tồn kho, publish. **Upload tối đa 3 ảnh** kéo thả lên Storage, xem trước, sắp xếp lại thứ tự |
| `/admin/danh-muc` | CRUD danh mục. **Chặn xoá danh mục còn sản phẩm** — báo rõ còn bao nhiêu sản phẩm |
| `/admin/don-hang` | Danh sách đơn (mặc định lọc `pending` lên trước), xem chi tiết, đổi trạng thái `pending → confirmed → shipping → done`. **Hủy đơn phải gọi RPC `veloce_cancel_order`** để hoàn tồn kho — không tự `update status = 'cancelled'` |
| `/admin/danh-gia` | CRUD đánh giá hiển thị trang chủ |
| `/admin/cai-dat` | **Trang quan trọng nhất khu admin — đây là màn demo bán hàng (mục 0.1).** Tên cửa hàng, khẩu hiệu, tiêu đề + mô tả hero; **3 màu chủ đạo** với color picker, **5 bộ màu dựng sẵn bấm-một-phát**, xem trước realtime không cần reload, và **cảnh báo khi tương phản < 3:1**; upload logo và ảnh hero; SĐT, email, địa chỉ, Facebook/Instagram/Zalo; mã giảm giá + % giảm; ngưỡng freeship + phí ship |

**Yêu cầu kỹ thuật khu admin:**
- Mọi thao tác ghi dùng **Server Action**, không gọi Supabase trực tiếp từ client cho việc ghi.
- Mọi Server Action **phải tự kiểm tra quyền admin** trước khi ghi. RLS là lớp chặn cuối, không phải lớp duy nhất — dựa hoàn toàn vào RLS thì lỗi trả về sẽ khó hiểu với người dùng.
- Sau mỗi lần ghi: `revalidatePath()` đúng chỗ (xem 4.8) + toast xác nhận.
- Xoá sản phẩm: hộp thoại xác nhận có gõ lại tên sản phẩm. Xoá xong **phải xoá luôn ảnh trong Storage**, nếu không bucket sẽ đầy rác.
- `middleware.ts` chặn mọi đường dẫn `/admin/*` (trừ `/admin/dang-nhap`) khi chưa đăng nhập.
- Form dài dùng `react-hook-form` + `zod`, hiển thị lỗi ngay dưới từng ô.

---

## 6. ĐẶC TẢ HIỆU ỨNG (chỉ áp dụng cho storefront, KHÔNG áp dụng cho `/admin`)

| Hiệu ứng | Cách làm | Áp dụng ở đâu |
|---|---|---|
| Smooth scroll | Lenis, `lerp: 0.09`, đồng bộ với GSAP ScrollTrigger | Toàn storefront |
| Reveal khi cuộn | Motion `whileInView`, `once: true`, `y: 40 → 0`, `duration .6`, `ease: [.22,1,.36,1]` | Mọi section |
| Stagger chữ | Tách từng ký tự/từ, delay 0.03s | H1, H2 |
| Magnetic button | Nút dịch theo chuột trong bán kính 80px, `spring` | CTA chính |
| Tilt 3D card | `rotateX/rotateY` ±10°, `perspective: 1000px`, glare chạy theo chuột | ProductCard, category card |
| Custom cursor | Vòng tròn `mix-blend-difference`, phóng to khi hover link, ẩn trên touch | Desktop storefront |
| Spotlight nền | Radial gradient theo chuột, `soft-light` | Hero, section tối |
| Marquee | CSS `@keyframes` translateX, `animation-play-state: paused` khi hover | Brand strip |
| Page transition | Overlay gradient quét ngang khi đổi route | Storefront |
| Pin + scrub | GSAP ScrollTrigger `pin: true, scrub: 1` | ScrollStory |
| Count up | Motion `useMotionValue` + `animate` | Section thống kê |
| Flying to cart | Clone ảnh, animate theo đường cong tới icon giỏ, icon nảy | Nút thêm vào giỏ |
| Hover ảnh sản phẩm | Đổi sang ảnh thứ 2, crossfade 300ms + zoom 1.05 | ProductCard |

### Ràng buộc hiệu năng (BẮT BUỘC)
- Chỉ animate `transform` và `opacity`. **Cấm** animate `width`, `height`, `top`, `left`, `box-shadow` trong vòng lặp.
- Hiệu ứng nặng (cursor, spotlight, tilt, aurora) chỉ bật khi `matchMedia("(pointer: fine)")`.
- Tôn trọng `prefers-reduced-motion: reduce` → tắt toàn bộ animation trang trí, giữ nội dung đầy đủ.
- Ảnh dùng `next/image`, ảnh hero `priority`, còn lại lazy + `sizes` đúng. Thêm `xsspvdgnhelzprcqaiek.supabase.co` vào `images.remotePatterns` trong `next.config.ts` (ảnh nằm trên Storage).
- Component có animation là Client Component; phần còn lại giữ Server Component.
- Không layout shift: mọi ảnh có `fill` + container `aspect-ratio`.

---

## 7. LỘ TRÌNH THỰC HIỆN (làm tuần tự, không nhảy cóc)

### 7.0 Cách vận hành — ĐỌC TRƯỚC KHI BẮT ĐẦU

**Ai duyệt cái gì.** Claude Code **không nhìn thấy giao diện đã render**. Nó không tự đánh giá được "đẹp", "sinh động", "hiệu ứng có mượt không".
- Claude Code chịu trách nhiệm: code chạy được, `npm run build` sạch, không lỗi TypeScript, đúng đặc tả kỹ thuật.
- **An chịu trách nhiệm duyệt thẩm mỹ.** Sau mỗi phase, mở `localhost:3000` xem thật rồi mới cho đi tiếp.
- Claude Code **không được tự tuyên bố "giao diện đã đẹp"** — chỉ báo cáo đã làm gì và mời An xem.

**Mỗi phase = một phiên làm việc riêng.** Dự án này dài hơn context window. Làm cả 8 phase trong một phiên sẽ khiến hội thoại bị nén và Claude Code quên bảng màu, quên tên component đã tạo, rồi đẻ ra `ProductCard2.tsx`. Cách đúng:
1. Xong một phase → An kiểm tra → `git commit`
2. Gõ `/clear` (hoặc mở phiên mới)
3. Phiên mới bắt đầu bằng: *"Đọc CLAUDE.md và PLAN.md. Phase N đã xong và đã commit. Làm Phase N+1."*

**Git là mạng lưới an toàn.** Commit sau mỗi phase với message `feat(phase-N): ...`.

**Khi gặp điểm chưa rõ:** dừng lại hỏi An, **không tự quyết** — đặc biệt với màu sắc, font, phạm vi tính năng, và mọi thứ động tới database.

---

### Phase 0 — Chuẩn bị
- [ ] `git init`, `.gitignore` chuẩn Next.js **+ `.env.local` + `.cache/`**
- [ ] Xác nhận Node ≥ 20 LTS. Dùng **npm** (không đổi giữa chừng)
- [ ] Đọc `CLAUDE.md`
- [ ] **An tạo tài khoản admin đầu tiên theo mục 4.5** — không có bước này thì Phase 7 không test được
- ✅ **Nghiệm thu:** `git log` có 1 commit; `select count(*) from veloce_admins` trả về ≥ 1

### Phase 1 — Nền móng + kết nối Supabase
- [ ] Khởi tạo Next.js 16 + TS + Tailwind v4
- [ ] `globals.css` với **kiến trúc màu hai tầng ở mục 2.1** — làm đúng ngay từ đầu, sửa sau phải đụng mọi component
- [ ] `.env.local`, 3 client Supabase (mục 4.7), `middleware.ts`
- [ ] `npx supabase gen types` → `src/types/database.ts`
- [ ] `lib/queries/settings.ts` + bơm màu vào `layout.tsx` (mục 2.1)
- [ ] `next/font`, `lib/cn.ts`, `lib/format.ts` (`2.890.000₫`), `lib/contrast.ts`
- [ ] Utility `.glass` `.glow-border` `.noise` + `AuroraBackground`, `NoiseOverlay`, `SmoothScroll`
- [ ] Header (trong suốt → glass khi cuộn, tên lấy từ DB) + Footer + MobileMenu
- [ ] `README.md`
- ✅ **Nghiệm thu:** trang trống nhưng có nền aurora, header hiện đúng tên cửa hàng lấy từ Supabase. **Đổi `color_primary` trực tiếp trong Supabase → reload → giao diện đổi màu theo.** Nghiệm thu này quan trọng nhất Phase 1.

### Phase 2 — Dữ liệu, ảnh, component nền
- [ ] `lib/queries/` cho products, categories, testimonials
- [ ] `scripts/upload-images.mjs` (mục 4.4) → `npm run gen:images` → kiểm tra 72 ảnh trên Storage và cột `images` đã đầy
- [ ] `store/cart.ts` (zustand persist, xử lý hydration mismatch)
- [ ] UI primitives: `Button` (gradient/glass/ghost), `Badge`, `Input`, `Reveal`, `MagneticButton`, `TiltCard`, `Skeleton`
- [ ] `ProductCard` + `ProductGrid`
- ✅ **Nghiệm thu:** render được grid 24 sản phẩm với ảnh thật từ Storage, hover có tilt + đổi ảnh

### Phase 3 — Trang chủ
- [ ] Hero (đọc `hero_headline` từ DB) đầy đủ hiệu ứng
- [ ] Marquee, CategoryShowcase, FeaturedGrid
- [ ] ScrollStory (GSAP pin + scrub)
- [ ] Stats count-up, Testimonials carousel, Newsletter
- ✅ **Nghiệm thu:** cuộn hết trang chủ mượt, không giật, mỗi section có hiệu ứng riêng

### Phase 4 — Danh sách & chi tiết sản phẩm
- [ ] `/san-pham` + FilterBar (có lọc màu bằng chấm tròn) + sort + layout animation
- [ ] `/san-pham/[slug]` + Gallery + Size/Color picker + **SizeGuide** + related
- ✅ **Nghiệm thu:** lọc mượt không giật, trang chi tiết đủ thông tin, `generateStaticParams` chạy đúng

### Phase 5 — Giỏ hàng & đặt hàng
- [ ] CartDrawer + `/gio-hang` + **thanh freeship** + mã giảm giá đọc từ settings
- [ ] Khóa nút mua khi `stock = 0`, hiện "Chỉ còn N đôi" khi `stock <= 5`
- [ ] `/thanh-toan` 3 bước + Server Action gọi **RPC `veloce_place_order`** (mục 4.8) + màn hình thành công
- ✅ **Nghiệm thu — làm đủ 3 việc:**
  1. Đặt một đơn thật → dòng mới xuất hiện trong `veloce_orders`, và **`stock` của sản phẩm đó giảm đúng số lượng**
  2. Thử đặt số lượng lớn hơn tồn kho → bị từ chối, thông báo tiếng Việt hiện đúng trên toast
  3. Sửa giá sản phẩm trong Supabase rồi mở lại đơn cũ → **đơn cũ vẫn giữ giá lúc đặt**

### Phase 6 — Trang phụ & hoàn thiện storefront
- [ ] `/ve-chung-toi`, `/lien-he` (thông tin từ settings)
- [ ] `PageTransition`, `CustomCursor`, 404 tùy biến
- [ ] SEO: metadata từng trang, OG image, `sitemap.ts`, `robots.ts`
- [ ] `loading.tsx`, `error.tsx`
- ✅ **Nghiệm thu:** đi trọn vẹn trang chủ → sản phẩm → giỏ → đặt hàng, không lỗi

### Phase 7 — KHU QUẢN TRỊ
- [ ] `middleware.ts` chặn `/admin/*`, `/admin/dang-nhap`, `admin/layout.tsx` + sidebar
- [ ] `/admin` bảng điều khiển
- [ ] `/admin/san-pham` (danh sách) + form thêm/sửa + `ImageUploader` lên Storage
- [ ] `/admin/danh-muc`, `/admin/don-hang`, `/admin/danh-gia`
- [ ] `/admin/cai-dat` — color picker + **5 bộ màu dựng sẵn** + cảnh báo tương phản + upload logo/hero
- [ ] `revalidatePath` sau mọi thao tác ghi (mục 4.9)
- ✅ **Nghiệm thu — làm đủ 6 việc này:**
  1. Thêm một sản phẩm mới có ảnh → xuất hiện ngoài `/san-pham`
  2. Sửa giá một sản phẩm → trang chi tiết đổi giá **không cần restart server**
  3. Đổi tên cửa hàng + khẩu hiệu → header, footer và tab trình duyệt đổi theo
  4. Bấm một bộ màu dựng sẵn → toàn site đổi màu. **Đây là màn demo bán hàng, bấm phải thấy đổi ngay.**
  5. Hủy một đơn hàng → **tồn kho sản phẩm trong đơn đó tăng trở lại**
  6. Đăng xuất, vào thẳng `/admin/san-pham` → bị đá về trang đăng nhập

### Phase 8 — Kiểm thử & tối ưu (KHÔNG BỎ QUA)
- [ ] Responsive 360 / 768 / 1024 / 1440 / 2560px
- [ ] Bật `prefers-reduced-motion`, xác nhận site vẫn dùng được
- [ ] Đi hết site bằng bàn phím: focus ring rõ, drawer/modal có focus trap + Esc
- [ ] **Kiểm tra RLS thật:** mở tab ẩn danh, thử gọi API sửa sản phẩm — phải bị từ chối
- [ ] **Rà ảnh lộ logo thương hiệu** (bắt buộc, xem mục 0.1) — mở bucket `veloce`, thay ảnh nào thấy rõ logo hãng khác
- [ ] **Tìm chuỗi "VELOCE" hardcode trong code** (`grep -ri veloce src/`) — mọi chỗ hiển thị phải đọc từ `settings.store_name`
- [ ] `npm run build` sạch, không warning TypeScript
- [ ] Lighthouse storefront: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95
- [ ] Chạy lại Supabase security advisor. **Hai cảnh báo về `veloce_place_order` là chủ ý** (mục 4.8) — đừng "sửa"

---

## 8. TIÊU CHUẨN CHẤT LƯỢNG

**Code**
- TypeScript `strict`, **không dùng `any`**. Type của bảng lấy từ `database.ts` sinh tự động.
- Component < 200 dòng; dài hơn thì tách.
- Không CSS inline rải rác — dùng Tailwind class + utility đã khai báo.
- `PascalCase.tsx` cho component, `camelCase.ts` cho lib.
- Comment tiếng Việt cho logic hiệu ứng phức tạp và cho mọi chỗ đụng RLS.

**Giao diện**
- Mobile-first. Hiệu ứng desktop phải có phương án nhẹ hơn trên mobile.
- Vùng bấm tối thiểu 44×44px.
- Trạng thái đầy đủ: default / hover / focus / active / disabled / loading / empty / error.

**Truy cập (a11y)**
- Ảnh có `alt` mô tả thật. Icon-only button có `aria-label`.
- Heading đúng thứ bậc, mỗi trang một `<h1>`.
- Contrast ≥ 4.5:1 — kiểm tra riêng chữ muted trên nền glass.

**Dữ liệu**
- Không bao giờ tin dữ liệu từ form: validate bằng `zod` ở **cả** client và Server Action.
- Giá lưu bằng `bigint` đơn vị đồng, **không dùng số thực** — `0.1 + 0.2 !== 0.3`.
- Đơn hàng lưu **bản chụp** tên và giá lúc đặt, không phải khoá ngoại tới sản phẩm.

---

## 9. NGUYÊN TẮC BẤT DI BẤT DỊCH

1. **Đẹp nhưng phải đọc được.** Hiệu ứng không cản trở việc xem thông tin sản phẩm và giá.
2. **Không giật.** Thà bỏ một hiệu ứng còn hơn để trang tụt khung hình.
3. **Nhất quán.** Một hệ màu, một cặp font, một kiểu bo góc, một đường cong easing `[.22,1,.36,1]`.
4. **Không lorem ipsum.** Mọi chữ hiển thị là tiếng Việt có nghĩa.
5. **Chỉ đụng bảng có tiền tố `veloce_`.** Project Supabase này còn dữ liệu của dự án khác.
6. **Không bao giờ đưa `service_role` key vào code ứng dụng.**
7. **RLS là lớp chặn cuối, không phải lớp duy nhất.** Server Action tự kiểm tra quyền trước.
8. **Không hardcode chuỗi "VELOCE" ở đâu cả** — luôn đọc `settings.store_name`. Đây là điều kiện để đổi thương hiệu trong 30 giây (mục 0.1).
9. **Tạo đơn chỉ qua RPC `veloce_place_order`**, hủy đơn chỉ qua `veloce_cancel_order`. Không đụng thẳng vào `veloce_orders` hay cột `stock` từ luồng mua hàng.
10. Làm xong mỗi phase thì **chạy `npm run dev` kiểm tra thật** rồi mới sang phase tiếp theo.

---

## 10. CÂU LỆNH KHỞI ĐỘNG CHO CLAUDE CODE

Mở terminal tại thư mục `shoe-shop`, chạy `claude`, rồi dán:

```
Đọc CLAUDE.md và toàn bộ PLAN.md trong thư mục này. Đây là đặc tả đã chốt,
không tự đổi stack / bảng màu / font.

Cơ sở dữ liệu Supabase đã dựng xong: 24 sản phẩm, RLS, Storage, và 2 hàm RPC
đặt hàng / hủy đơn đã kiểm thử. Đừng tạo lại gì cả.

Làm Phase 0 và Phase 1 theo mục 7 của PLAN.md, dừng lại ở đó.
Chú ý đặc biệt mục 2.1: kiến trúc màu hai tầng với @theme inline.
Làm sai chỗ này thì admin sẽ không đổi được màu, và sửa sau rất tốn công.
Cũng đọc kỹ mục 0.1: đây là sản phẩm mẫu để bán, nên không được hardcode
tên "VELOCE" ở bất kỳ đâu — luôn đọc từ settings.store_name.

Lưu ý: bạn không nhìn thấy giao diện render, nên đừng tự đánh giá là đẹp.
Xong thì chạy npm run dev, báo cáo đã tạo file gì, và mời tôi mở
localhost:3000 kiểm tra. Nếu có điểm nào chưa rõ, hỏi tôi trước khi tự quyết.
```

**Sau mỗi phase** — An mở `localhost:3000` xem thật, ưng thì:
```
Phase [N] tôi đã xem, ổn. Hãy git commit với message "feat(phase-N): ..."
```
Rồi gõ `/clear`, mở phiên mới và dán:
```
Đọc CLAUDE.md và PLAN.md. Phase [N] đã xong và đã commit.
Làm Phase [N+1] theo mục 7. Trước khi code, liệt kê ngắn gọn
các file sẽ tạo/sửa để tôi duyệt.
```

**Nếu kết quả chưa đủ "wow"** — đừng nói chung chung "làm đẹp hơn đi", Claude Code sẽ đoán mò. Chỉ đích danh:
```
Section Hero: chữ H1 hiện lên quá nhanh và ảnh giày đứng yên.
Tăng stagger lên 0.05s, thêm floating animation theo mục 6, và
tăng độ sáng quầng glow phía sau giày.
```

---

## 11. GỢI Ý MỞ RỘNG (sau khi v1 chạy tốt — chưa làm bây giờ)

- **Email báo đơn mới + email xác nhận cho khách (Resend).** An chọn tự vào `/admin` xem đơn, hợp lý cho giai đoạn demo. Nhưng khi bán cho chủ shop thật thì đây là thứ họ sẽ hỏi đầu tiên — làm sẵn thì dễ chốt hơn.
- **Chế độ "khởi tạo cho khách mới"**: một trang admin xoá sạch sản phẩm mẫu và reset settings, để bàn giao cho từng chủ shop mà không phải sửa database bằng tay.
- Giày 3D xoay được bằng React Three Fiber ở Hero
- Tài khoản khách hàng: đăng nhập, xem lịch sử đơn, lưu địa chỉ
- Tích hợp thanh toán VNPay / MoMo
- Tìm kiếm mờ bằng `fuse.js` hoặc Postgres full-text search
- Đa ngôn ngữ Việt / Anh
- Deploy Vercel + gắn domain
- Bật **Leaked Password Protection** trong Supabase (Authentication → Policies) — hiện đang tắt

---

## PHỤ LỤC A — PATTERN HỌC TỪ CÁC SITE THAM KHẢO

Rút ra từ khảo sát Awwwards (Scrolling & E-Commerce), Nike/adidas/On Running, Ananas/Biti's Hunter, và các nhà bán giày da Việt Nam (Laforce, Antoni Fernando). **Pattern để áp dụng, không phải để sao chép giao diện.**

### A1. Điều các site đoạt giải làm giống nhau

| Pattern | Cụ thể | Áp dụng ở đâu |
|---|---|---|
| **Smooth scroll là nền tảng** | Gần như 100% dùng Lenis hoặc Locomotive. Không có nó, mọi hiệu ứng scroll khác đều gãy | Phase 1 |
| **Pin + scrub kể chuyện** | Ghim một phần tử, cuộn để đổi trạng thái thay vì cuộn để trôi qua | `ScrollStory` |
| **Horizontal scroll xen kẽ** | Một section cuộn ngang giữa trang cuộn dọc — tạo nhịp | Cân nhắc cho CategoryShowcase |
| **Chữ là nhân vật chính** | Typography khổ lớn, tách ký tự, animate riêng từng chữ | Hero H1 |
| **Chuyển cảnh giữa trang** | Overlay quét ngang, không để trang trắng nhấp nháy | `PageTransition` |
| **Ít màu, đậm chất** | Thường chỉ 2–3 màu chủ đạo, không phải cầu vồng | Bảng màu mục 2.1 |

**Cảnh báo từ chính các site này:** nhiều site đoạt giải Awwwards có Lighthouse Performance dưới 50. Chúng đoạt giải thiết kế, không phải giải thương mại. Website bán hàng mà tải 8 giây thì khách rời trước khi thấy đôi giày. Đây là lý do PLAN.md đặt ngưỡng ≥ 85 và loại Three.js ở v1.

### A2. Điều các thương hiệu lớn làm ở trang sản phẩm

Nike, adidas và On Running đều hội tụ về cùng một cấu trúc — đã tối ưu qua hàng triệu đơn hàng:

1. **Ảnh chiếm hơn nửa màn hình** ở desktop, thumbnail dọc bên trái
2. **Giá ngay dưới tên**, không phải cuối trang
3. **Chọn màu trước, chọn size sau** — đổi màu thì gallery đổi theo
4. **Size hết hàng vẫn hiển thị nhưng gạch chéo**, không ẩn đi
5. **Nút thêm vào giỏ dính đáy màn hình trên mobile**
6. **Thông số kỹ thuật ở tab riêng**, không đổ hết ra trang chính
7. **"Có thể bạn thích" ngay dưới**, cùng category

→ Mục 5.3 đã theo đúng cấu trúc này. Giữ nguyên, đừng sáng tạo lại.

### A3. Điều thị trường Việt Nam làm khác

| Điểm | Ghi nhận | Đã đưa vào dự án |
|---|---|---|
| **Size 39–45** | Ananas, Biti's đều dùng dải này cho nam, không song song US/UK | Cột `sizes` |
| **Lọc màu bằng chấm tròn** | Biti's lọc theo 13 màu bằng chấm màu chứ không phải chữ | `FilterBar`, Phase 4 |
| **Luôn hiện giá gốc gạch ngang** | Antoni Fernando giảm từ 2.300.000₫ còn 999.000₫, hiển thị cả hai | Cột `original_price` |
| **Ngưỡng freeship** | Biti's: miễn phí ship đơn ≥ 1.000.000₫ | `settings.freeship_threshold` |
| **Mô tả nêu thông số rất cụ thể** | "da bò thuộc Tây Ban Nha", "cấu trúc khâu Mckay" — không nói chung chung | 24 sản phẩm đã viết theo lối này |
| **Mã giảm giá hiện công khai** | Shop VN đặt mã giảm ngay trên trang, không giấu | `settings.coupon_code` |
