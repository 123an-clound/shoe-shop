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

## Tồn kho theo màu và size

Trước khi lưu tồn kho theo biến thể, áp dụng migration
`supabase/migrations/20261012134125_veloce_variant_inventory.sql` trong Supabase SQL Editor.
Migration chỉ cập nhật hàm/trigger của `veloce_*`, không tạo lại bảng hay phân bổ dữ liệu cũ.
RPC đặt/hủy đơn cập nhật đúng màu và size trong một transaction; tổng `stock` được trigger tính lại.
Các sản phẩm cũ tiếp tục dùng tổng kho cho đến khi chủ shop nhập số thực tế theo biến thể.

Trong admin, vào **Sản phẩm** → **Điều chỉnh tồn kho** của sản phẩm cần sửa.
Với sản phẩm chưa phân bổ, chọn **Phân bổ tồn kho theo biến thể**, nhập số đôi thực tế
cho từng màu/size rồi bấm **Lưu tồn kho**. Nhập 0 cho biến thể hết hàng; tổng kho tự tính lại.
Màn hình này chỉ cập nhật tồn kho và giữ nguyên thông tin sản phẩm. Nếu tồn kho thay đổi
do đơn hàng hoặc quản trị viên khác trong lúc đang sửa, tải lại trang trước khi lưu.
Trong **Ảnh đại diện theo màu**, chọn ảnh đã tải lên. Liên kết dùng URL ảnh nên sắp xếp lại
không làm sai màu; xóa ảnh sẽ xóa liên kết và dùng ảnh đầu tiên làm dự phòng.
Nếu màu/size của đơn đang chờ đã bị xóa, khôi phục biến thể đó trước khi hủy đơn để hoàn kho đúng.

Kiểm thử: `npm test`, `npm run lint`, `npm run build`. Kiểm thử PostgreSQL độc lập:
`node tests/product-inventory-db.mjs <path-to-pglite/dist/index.js>` (PGlite là runtime test tùy chọn,
không phải dependency của ứng dụng).

## Xử lý đơn online trong admin

Mở **Đơn hàng** để xem hàng đợi xác nhận, đóng gói, giao hàng, đối soát và hoàn tiền.
Các chỉ số đầu trang tính trên toàn cửa hàng; bảng bên dưới áp dụng bộ lọc đang chọn.
Tìm theo mã đơn, tên khách, điện thoại, email hoặc mã vận đơn; lọc ngày theo giờ Việt Nam.
Danh sách cập nhật mỗi 45 giây khi tab đang mở và bạn không nhập liệu.

Trong chi tiết đơn, xác nhận đơn rồi nhập hãng vận chuyển, mã vận đơn và đánh dấu
đã kiểm đủ sản phẩm/đóng gói. Lưu thông tin trước khi bàn giao vận chuyển.
Giao thành công và thu tiền là hai bước riêng. Ghi nhận thu tiền/hoàn tiền chỉ cập nhật
đối soát nội bộ, không gọi cổng thanh toán. Các đơn trước migration có thanh toán
**Chưa đối soát** để tránh suy diễn rằng đơn hoàn tất đã được thu tiền.

Hủy đơn yêu cầu lý do và nhập lại mã đơn. Với đơn đang giao, xác nhận hàng đã về kho
trước khi hoàn tồn kho. Hệ thống vẫn dùng RPC hoàn kho theo màu/size hiện có.
Nếu đơn đã thu tiền bị hủy, thực hiện hoàn tiền rồi ghi nhận đã hoàn tiền trong admin.
Lịch sử ghi người thao tác và thời gian; client chỉ đọc, không sửa/xóa lịch sử.
Mọi lần lưu so sánh phiên bản để không ghi đè thao tác của nhân viên khác.

**In phiếu đóng gói** chỉ in thông tin khách, sản phẩm và số tiền cần thu; ghi chú nội bộ,
điều hướng và lịch sử không xuất hiện trên phiếu. **Xuất CSV** áp dụng đúng bộ lọc,
tối đa 2.000 đơn mỗi lần; file có UTF-8 BOM và bảo vệ ô khỏi công thức spreadsheet.
Chưa tích hợp tạo vận đơn, đồng bộ hãng vận chuyển, gateway hoặc gửi thông báo tự động.

Migration: `supabase/migrations/20261013073147_veloce_order_operations.sql`.
Sau đó áp dụng `20261013082046_veloce_order_event_timestamps.sql` để lịch sử ghi
thời điểm thực của từng thao tác trong cùng giao dịch.
Chỉ bổ sung cột vào `veloce_orders`, lịch sử `veloce_order_events` và các hàm/trigger `veloce_*`.
Kiểm thử database: `node tests/order-operations-db.mjs <path-to-pglite/dist/index.js>`.

## Tài khoản khách hàng và theo dõi đơn

Mở nút **Đăng nhập / Tài khoản** trên đầu trang hoặc **Giỏ hàng → Tài khoản & Đơn hàng của tôi**.
Mục này vẫn xuất hiện khi giỏ trống. Bước thanh toán cũng hiển thị tài khoản nhận đơn,
cho phép đăng nhập/đăng xuất mà vẫn giữ giỏ hàng và thông tin đang điền.
Khách có thể đăng nhập bằng **số di động Việt Nam + mã OTP qua SMS** hoặc **Google**.
Đơn đặt khi đã đăng nhập được lưu vào tài khoản, phân trang 20 đơn, xem trạng thái,
chi tiết size/màu, thanh toán, hãng vận chuyển và mã vận đơn. Bấm **Cập nhật trạng thái**
để lấy dữ liệu mới nhất sau khi nhân viên xử lý đơn trong admin.
Các mục **Tất cả**, **Đang xử lý** (chờ xác nhận, chuẩn bị, đang giao) và **Lịch sử**
(đã giao, đã hủy) lọc trước khi phân trang. Số lượng tính trên toàn bộ đơn của tài khoản.
Đăng xuất không xóa lịch sử đã lưu; đăng nhập lại cùng tài khoản để xem tiếp.
Nên đăng nhập Google trước khi điền thông tin: việc chuyển sang Google tải lại trang,
nên thông tin checkout chưa gửi không được giữ qua chuyển hướng OAuth.

Khách chưa đăng nhập vẫn đặt COD được. Biên nhận riêng được lưu trong cookie HttpOnly
trên thiết bị, tối đa 5 đơn và 7 ngày; trang thành công đọc đơn thật qua biên nhận này.
Đăng nhập trên cùng trình duyệt sẽ gắn các biên nhận hợp lệ vào tài khoản.
Đăng xuất xóa biên nhận trên trình duyệt và giữ giỏ hàng; đơn đã lưu vẫn ở tài khoản.
Đơn trước nâng cấp không tự nhận qua số điện thoại/email nhập khi mua: cần cửa hàng xác minh.
Nếu phiên đăng nhập đổi trong lúc một lần thanh toán chưa có kết quả chắc chắn,
kiểm tra lịch sử hoặc liên hệ shop trước khi đặt lại; hệ thống giữ mã yêu cầu để tránh đơn trùng.

Áp dụng `supabase/migrations/20261013090202_veloce_customer_accounts.sql` trước khi deploy.
Sau đó áp dụng `20261013122916_veloce_customer_order_groups.sql` cho bộ lọc và số lượng đơn.
Các bảng đơn hàng và lịch sử admin vẫn chỉ admin đọc được; RPC khách trả đúng phần
thông tin cần hiển thị, không trả ghi chú nội bộ hoặc nhật ký nhân viên.
Kiểm thử database: `node tests/customer-accounts-db.mjs <path-to-pglite/dist/index.js>`.

### Bật đăng nhập thật

Cả Phone và Google hiện đang tắt trên project Supabase. Giao diện sẽ thông báo đúng
tình trạng thay vì giả lập đăng nhập. Cấu hình trong **Supabase Dashboard → Authentication**:

1. **URL Configuration:** Site URL là domain thật của shop. Thêm redirect URL chính xác
   `https://<domain-shop>/api/auth/callback` và `http://localhost:3000/api/auth/callback`
   khi phát triển; thêm URL tương ứng cho preview nếu dùng. Callback chỉ quay về giỏ hàng hoặc thanh toán,
   không nhận đường dẫn tùy ý. Khai báo `NEXT_PUBLIC_SITE_URL` theo `.env.example`.
2. **Sign In / Providers → Google:** bật Google, nhập OAuth client ID và secret trực tiếp
   tại Supabase. Google Cloud Console dùng Authorized redirect URI
   `https://jtizooyjnllostamffpp.supabase.co/auth/v1/callback`; thêm domain shop vào
   Authorized JavaScript origins. Nếu consent screen ở chế độ testing, thêm tài khoản test.
3. **Phone:** bật Phone và cấu hình nhà cung cấp SMS được Supabase hỗ trợ cùng khóa,
   sender/service ID. Dùng OTP 6 chữ số, giữ xác thực SMS thực tế và giới hạn gửi mã.
   Không đưa khóa SMS hoặc Google client secret vào frontend, Git hay chat.
4. Sau khi lưu, đợi tối đa 60 giây rồi tải lại giỏ hàng. Kiểm tra nhận/nhập OTP,
   Google callback, đặt COD khi đăng nhập, cập nhật đơn từ admin rồi kiểm tra trên
   thiết bị khác. Kiểm tra thêm đăng nhập sau một đơn guest trên cùng trình duyệt.

Project Supabase này dùng chung với ứng dụng khác: giữ nguyên các redirect URL và
cấu hình hiện có khi bổ sung domain shop. Hai phương thức đăng nhập tạo tài khoản
theo identity riêng; hệ thống không tự gộp tài khoản Google và số điện thoại.

Tài liệu chính thức: [Phone login](https://supabase.com/docs/guides/auth/phone-login),
[Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google).

## Tiến độ

Xem mục 7 của `PLAN.md` cho lộ trình theo phase. Trạng thái hiện tại được cập
nhật qua các commit `feat(phase-N): ...`.
