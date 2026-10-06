# _seed — Tài liệu mồi cho dự án VELOCE

Thư mục này chứa những gì đã chuẩn bị sẵn để Claude Code không phải tự bịa.
**Sau khi dùng xong (cuối Phase 2), chép file vào đúng chỗ rồi XÓA thư mục `_seed/`.**

| File trong `_seed/` | Chép tới |
|---|---|
| `scripts/upload-images.mjs` | `scripts/upload-images.mjs` |
| `sql/*.sql` | `supabase/migrations/` (chỉ để đối chiếu — **đã áp lên database rồi**) |

---

## 1. Database đã dựng xong

Toàn bộ bảng, RLS, Storage bucket và dữ liệu đã được tạo trên Supabase ngày **25/08/2026**.
**Không chạy lại các file SQL trong `sql/`** — chúng chỉ để đọc và đối chiếu khi cần hiểu schema.

Project: `Web-project` · ref `jtizooyjnllostamffpp` · Seoul

| Bảng | Đã có |
|---|---|
| `veloce_categories` | 5 danh mục |
| `veloce_products` | **24 sản phẩm** (cột `images` còn rỗng — xem bước 3) |
| `veloce_settings` | 1 dòng (id = 1) |
| `veloce_testimonials` | 6 đánh giá tiếng Việt |
| `veloce_admins` | **0 dòng — phải làm bước 2** |
| `veloce_orders` | 0 |

> ⚠️ Project này **còn chứa dữ liệu của dự án khác** (`bakery`, `kho_iphone`, `menu_items`, `categories`, `admin_users`). Chỉ đụng bảng có tiền tố `veloce_`.

---

## 2. Tạo tài khoản admin đầu tiên — LÀM TRƯỚC TIÊN

Bảng `veloce_admins` đang rỗng, nghĩa là **chưa ai vào được trang quản trị**. Đây là chủ ý: không đặt sẵn mật khẩu mặc định trong file kế hoạch.

**Bước 1** — Supabase Dashboard → **Authentication → Users → Add user**
→ nhập email và mật khẩu tự chọn → tick **Auto Confirm User**.

**Bước 2** — Dashboard → **SQL Editor** → chạy:
```sql
insert into public.veloce_admins (user_id, email, full_name)
select id, email, 'Phạm Tuấn An'
from auth.users
where email = 'EMAIL_VUA_TAO'
on conflict (user_id) do nothing;
```

Kiểm tra: `select * from public.veloce_admins;` phải trả về 1 dòng.

Muốn thêm admin khác sau này thì lặp lại 2 bước trên. **Cố ý không có giao diện tự thêm admin** — cấp quyền cao nhất mà chỉ cần điền một form thì rủi ro quá lớn so với tiện lợi.

---

## 3. Sinh và tải ảnh sản phẩm lên Storage

Cột `images` của 24 sản phẩm hiện là mảng rỗng. Script `upload-images.mjs` sẽ:
tải ảnh gốc Unsplash theo cột `unsplash_id` → cắt thành 3 khung (toàn cảnh / cận chi tiết / góc nghiêng) → upload lên bucket `veloce` → cập nhật cột `images`.

```bash
npm i -D sharp tsx
npm pkg set scripts.gen:images="tsx scripts/upload-images.mjs"
npm run gen:images
```

Thêm vào `.env.local` (và nhớ `.gitignore` file này):
```
NEXT_PUBLIC_SUPABASE_URL=https://jtizooyjnllostamffpp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1i_JXF8ar4zT9eCrRdch0A_9TG-UhaP
VELOCE_ADMIN_EMAIL=email-admin-vua-tao
VELOCE_ADMIN_PASSWORD=mat-khau-vua-tao
```

Script **phải đăng nhập** vì RLS chặn ghi Storage với vai trò anon. Đây là chủ ý — đừng "sửa" bằng cách dùng `service_role` key.

Lần chạy đầu mất 2–3 phút (tải 24 ảnh gốc). Ảnh gốc cache ở `.cache/unsplash/` nên chạy lại rất nhanh — nhớ thêm `.cache/` vào `.gitignore`.

Kiểm tra sau khi chạy:
```sql
select count(*) from public.veloce_products where array_length(images, 1) = 3;
-- phải trả về 24
```

---

## 3b. Đặt hàng chỉ qua RPC

Database đã có sẵn 2 hàm, **đã kiểm thử thật** (trừ kho đúng, chặn mua vượt tồn, chặn size không có):

- `veloce_place_order(...)` — con đường **duy nhất** tạo đơn
- `veloce_cancel_order(uuid)` — hủy đơn và hoàn kho, chỉ admin

❌ Không `insert` thẳng vào `veloce_orders`. ❌ Không tự `update` cột `stock`.
Chi tiết cách gọi ở `PLAN.md` mục 4.8.

---

## 4. Ba việc dễ quên nhất

**a) `@theme inline` cho màu thương hiệu.** Thiếu từ khoá `inline`, Tailwind resolve màu ra hex cứng lúc build và tính năng "admin đổi màu" không hoạt động. Xem `PLAN.md` mục 2.1.

**b) `revalidatePath` sau mỗi thao tác ghi trong admin.** Bỏ bước này thì admin sửa xong mà trang ngoài vẫn hiện dữ liệu cũ — lỗi rất hay gặp và rất khó nhận ra. Xem `PLAN.md` mục 4.8.

**c) Sinh lại type sau khi đổi schema:**
```bash
npx supabase gen types typescript --project-id jtizooyjnllostamffpp > src/types/database.ts
```

---

## 5. Về dữ liệu 24 sản phẩm

- Phân bổ: sneaker 8, thể thao 4, giày da 5, loafer 4, boot 3
- Tất cả mang thương hiệu hư cấu **VELOCE** với 5 dòng: Aero (sneaker), Pulse (thể thao), Meridian (giày da), Cordell (loafer), Ridge (boot). Cố tình **không** dùng tên Nike/adidas/New Balance để tránh vấn đề nhãn hiệu.
- **Giá bám mặt bằng thị trường Việt Nam 08/2026**, đối chiếu từ:
  - Sneaker nội địa (Ananas, Biti's Hunter): 290.000₫ – 1.100.000₫
  - Giày da nam cao cấp (Laforce, Antoni Fernando): 1.500.000₫ – 2.500.000₫
  - Boot da: 2.200.000₫ – 2.600.000₫
- Mô tả và thông số viết bằng tiếng Việt tự nhiên, mỗi sản phẩm có 4 gạch đầu dòng thông số cụ thể (trọng lượng, độ dày da, kiểu khâu, drop đế…) — không nói chung chung.

## 6. Việc còn tồn trên Supabase (không chặn phát triển)

- **Leaked Password Protection đang tắt.** Bật ở Dashboard → Authentication → Policies. Nên bật trước khi có người dùng thật.
- Cảnh báo `public.set_updated_at has a role mutable search_path` là của **dự án khác** trong cùng project, không phải của VELOCE. Đừng tự sửa hàm đó.
- Hai cảnh báo về `veloce_place_order` (SECURITY DEFINER, anon gọi được) là **chủ ý và bắt buộc** — khách vãng lai phải đặt hàng được mà không có quyền update tồn kho. Đừng revoke execute.
