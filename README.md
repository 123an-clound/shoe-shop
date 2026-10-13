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

## Tiến độ

Xem mục 7 của `PLAN.md` cho lộ trình theo phase. Trạng thái hiện tại được cập
nhật qua các commit `feat(phase-N): ...`.
