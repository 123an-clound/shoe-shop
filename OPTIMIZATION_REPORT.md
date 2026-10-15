# Kết quả triển khai tối ưu

Ngày 15/10/2026. Đã triển khai thay đổi trong mã nguồn và migration giới hạn lạm dụng của shop; chưa deploy website. Giữ Next.js, Supabase, VI/EN, light/dark, giá server, RLS, tồn kho theo biến thể và idempotency.

**Phần kiểm thử tự động đã đạt. Gate phát hành còn mở vì LCP chưa đạt 2,5 giây, chưa kiểm tra thiết bị vật lý/preview và admin chưa có MFA đã xác minh.**

**1. Những gì đã thay đổi**

| Phạm vi | Kết quả |
|---|---|
| Điện thoại/tablet | Sửa ngắt dòng/min-width tại chi tiết sản phẩm; input 16px, bàn phím điện thoại và autofill; đo chiều cao thanh mua để chừa nội dung; safe area và viewport động. |
| Khả năng tiếp cận | Menu/drawer dùng modal native, giữ focus, Escape, trả focus và khóa cuộn; bổ sung skip link, điều hướng bàn phím cho tabs/size/màu; tăng vùng chạm, sửa token chữ thiếu tương phản. Đã sửa riêng hành vi Safari không tự focus nút khi chạm. |
| Tương tác | Gallery có trước/sau, số ảnh, vuốt ngang và phóng to; bộ lọc lưu URL, giữ khi Back; kết quả xuất theo nhóm 24 và có Xem thêm. Điều khiển video native giữ nguyên. |
| Thị giác | Giữ theme/font hiện có; căn nhịp card và giá; nền tĩnh nhẹ trên touch/tablet; admin tablet dọc dùng điều hướng ngang, sản phẩm có card thay cho bảng rộng. |
| Hiệu năng | Tách dữ liệu summary/chi tiết; cart drawer tải khi mở; bỏ Motion khỏi hiệu ứng đơn giản trên đường tải chính; CSS/API trình duyệt cho reveal/tilt/chuyển trang; không ẩn nội dung SSR để chờ animation; sửa `sizes`, ưu tiên ảnh đầu; tắt prefetch tự động của card sản phẩm; giảm fetch session trùng. |
| Asset | Favicon từ 148.405 xuống 21.077 byte, giữ hình gốc trong các kích thước icon phù hợp. |
| Bảo mật | Vá `source-map-js` 1.2.2; thêm counter/trigger tại database để mọi RPC đặt hàng đều chịu giới hạn; rate guard cho action đăng nhập/OTP; header nosniff, chống nhúng, Referrer/Permissions Policy và CSP Report-Only có nonce từng request. |

Testimonials chỉ autoplay trên con trỏ chính xác, không reduced motion và dừng khi người dùng tương tác. Native scrolling vẫn giữ; không thêm 3D/WebGL. Các thành phần Motion khác ngoài đường tối ưu vẫn được giữ trong dự án.

CSP nonce cần document render theo request. Root layout đã được đánh dấu dynamic rõ ràng để tránh lỗi prefetch/static bailout trên Next 16. Cache có tag cho dữ liệu public vẫn được giữ; không thêm cache dùng chung cho identity/đơn hàng. Đây là đánh đổi có chủ ý giữa CSP và cache toàn trang.

**2. Số đo thực tế**

Lighthouse 13.4.1, production `next start`, localhost:3100, mobile 412×823, DPR 1,75, CPU/mạng mô phỏng như baseline. Cột sau là median của ba lần đo mỗi route, không phải dữ liệu người dùng thật.

| Chỉ số | Trang chủ trước | Trang chủ sau | Sản phẩm trước | Sản phẩm sau |
|---|---:|---:|---:|---:|
| Performance | 79 | **89** | 83 | **90** |
| Accessibility | 100 | **100** | 97 | **100** |
| Best Practices | 100 | **100** | 100 | **100** |
| SEO | Chưa đo | **100** | Chưa đo | **100** |
| LCP mô phỏng | 5,56s | **3,78s** | 4,66s | **3,62s** |
| TBT | 80ms | **27,5ms** | 52ms | **38,5ms** |
| CLS | 0 | **0** | 0 | **0** |
| Tổng tải | 789KiB | **566KiB** | 674KiB | **511KiB** |

JavaScript trang chủ từ 337.452 xuống **207.294 byte**, giảm khoảng **39%**. Đạt ngân sách JavaScript 250KiB và giữ CLS tốt; trang chủ vẫn thấp hơn mục tiêu Performance 90 một điểm. **Cả hai route chưa đạt ngân sách LCP 2,5 giây. INP thực tế chưa đo; TBT không thay thế INP.**

Dữ liệu public hiện có 104 sản phẩm, baseline cũ có 21 sản phẩm và thứ tự nội dung đã khác. Vì vậy so sánh không phải thí nghiệm với toàn bộ nội dung cố định. Ảnh hero và slug sản phẩm mẫu vẫn được dùng để đối chiếu. Không lấy số localhost làm cam kết production.

- [Dữ liệu tổng hợp ba lần đo](artifacts/optimization-metrics.json).
- Trang chủ: [lần 1](artifacts/release-home-mobile-1.report.html), [lần 2](artifacts/release-home-mobile-2.report.html), [lần 3](artifacts/release-home-mobile-3.report.html).
- Sản phẩm: [lần 1](artifacts/release-product-mobile-1.report.html), [lần 2](artifacts/release-product-mobile-2.report.html), [lần 3](artifacts/release-product-mobile-3.report.html).
- Giao diện: [điện thoại trang chủ](artifacts/optimized-home-390.png), [chi tiết sản phẩm](artifacts/optimized-product-390.png), [danh sách tablet](artifacts/optimized-listing-820.png).

Các báo cáo không có `runtimeError`. Một số lần CLI trả exit 1 vì Windows không dọn được profile Chrome tạm (`EPERM`) sau khi đã ghi báo cáo; log CLI nằm cạnh JSON/HTML. Không mô tả các lệnh này là kết thúc sạch.

**3. Kiểm thử đã chạy**

| Kiểm tra | Kết quả |
|---|---|
| `npm test` | 46/46 đạt |
| `npm run lint` | Đạt, không warning |
| `npm run build` | Đạt, gồm TypeScript |
| `npm run test:db` | 4 bộ PostgreSQL/PGlite đạt |
| `npm run test:e2e` | 12/12 đạt: Chrome và WebKit mô phỏng iPhone |
| `npm audit --omit=dev` | 0 cảnh báo |
| `git diff --check` | Đạt |

E2E kiểm tra VI/EN qua 360, 390, 430, 600, 768, 820, 1024, 1180 và 1440px; đổi sang light ở 390px; menu, focus, Back với bộ lọc, gallery, reduced motion, bàn phím size, lazy cart, validation checkout, khôi phục sau lỗi mạng và CSP nonce mới từng request.

Không tạo đơn thật trong E2E. Lần bấm xác nhận duy nhất được thực hiện sau khi tắt mạng của browser context. Thành công COD, retry, rollback kho, receipt, quyền khách A/B và admin được kiểm bằng PostgreSQL biệt lập, không sửa dữ liệu khách thật.

Chạy lại:

```powershell
npm test
npm run test:db
npm run lint
npm run build
npx playwright install webkit
npm run test:e2e
```

E2E dùng Chrome đã cài trên máy và WebKit do Playwright quản lý. Server test chạy cổng 3101 từ build production; không dùng dev server để kết luận hiệu năng.

**4. Migration và giới hạn lạm dụng**

Đã áp dụng `supabase/migrations/20261015033947_veloce_abuse_protection.sql` vào project đã xác minh của shop. Version local khớp migration history remote. Chỉ thêm đối tượng `veloce_*` và trigger vào ba bảng shop; không seed, sửa đơn cũ hoặc đổi Auth toàn project. Type RPC được lấy từ type generator Supabase; phần type của các ứng dụng khác được giữ nguyên.

| Đường xử lý | Giới hạn hiện tại |
|---|---|
| Đơn mới theo số điện thoại đã chuẩn hóa | 5 đơn/15 phút; 20 đơn/ngày |
| Đơn mới theo tài khoản xác thực | 20 đơn/giờ |
| Đơn mới toàn shop | 60 đơn/phút |
| Contact/newsletter | 5 lần/email/giờ và 60 lần/phút cho mỗi loại form trên toàn shop |
| Action đăng nhập admin | 10 lần/email/15 phút |
| Action gửi OTP | 3 lần/email/10 phút |
| Action xác minh OTP | 10 lần/email/10 phút |
| Auth action toàn shop | 200 lần/phút |

Đây là cửa sổ giới hạn tính từ lần đầu, không phải sliding window. Đơn retry hợp lệ không insert nên không tiêu thêm quota đơn. Lỗi trigger rollback transaction, gồm trừ kho. Counter nằm trong schema private, RLS bật, `anon` và `authenticated` không có quyền đọc bảng.

Đã xác minh trên database thật: ba trigger bật và ACL counter không công khai. Test biệt lập xác nhận cả ba RPC đặt hàng, retry, rollback, số điện thoại `0`/`+84`, hết cửa sổ và email luân phiên đều qua guard.

Giới hạn auth trong ứng dụng bổ sung cho cơ chế của Supabase Auth; không thay thế bảo vệ endpoint Auth trực tiếp. Quota toàn shop giúp hạn chế luân phiên identity nhưng có thể ảnh hưởng lưu lượng hợp lệ khi tăng trưởng; cần theo dõi rồi điều chỉnh có kiểm chứng. Đây không phải cam kết chặn được mọi bot/COD giả.

Supabase advisor còn nhắc có chủ đích:

- Counter private bật RLS không có policy để client không truy cập: [giải thích advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Các RPC guest `SECURITY DEFINER` được public có kiểm soát, gồm guard auth: [giải thích advisor](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable). Không revoke guest checkout máy móc.

**5. Các gate còn mở trước phát hành**

| Gate | Trạng thái và việc còn lại |
|---|---|
| Design/responsive | Đã xem screenshot và kiểm tra browser. Cần chủ shop duyệt thị giác, kiểm tra zoom 200%, landscape và thiết bị vật lý; admin sau đăng nhập chưa có phiên test. |
| Accessibility/motion | Lighthouse 100, keyboard/modal và reduced motion đã kiểm. Chưa xác minh VoiceOver/TalkBack thật, mọi preset màu và mọi trạng thái admin. |
| Performance | Giảm tải và TBT/CLS đạt; LCP còn 3,78s/3,62s. Cần profile trên preview, tách phần render/JS còn lại và đo field INP trước khi đóng gate. |
| Security | Guard/RLS/ACL/test và audit production đạt. CSP mới Report-Only, chưa enforce; chưa xác minh HSTS/headers trên HTTPS thật. |
| MFA/auth | Có 0 admin shop có factor MFA verified ở thời điểm kiểm tra. Cần enrollment/challenge bằng tài khoản test và xác minh OTP/OAuth thật trước khi bắt buộc MFA; không tự bật cấu hình Auth dùng chung. |
| SEO/release | Lighthouse SEO đạt trên hai trang local. Cần cấu hình `NEXT_PUBLIC_SITE_URL` đúng domain và chạy page/technical trên preview; chưa deploy hoặc promote production. |
| 3D | Không áp dụng. |

Full `npm audit` còn 5 High trong cùng chuỗi dependency dev `braces → micromatch → fast-glob → eslint-config-next`. `braces` mới nhất được registry trả về vẫn là 3.0.3, chưa có bản vá cho [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Không hạ ESLint config về Next 14 theo `audit fix --force`, vì sẽ phá sự tương thích stack. Đây là rủi ro toolchain cần theo dõi; không có đường input khách hàng vào glob ESLint được phát hiện trong ứng dụng.

README/PLAN gốc còn một số thông tin provider/project cũ; không thay cấu hình/dữ liệu thật theo các giá trị đó. Tài nguyên favicon PNG dự phòng không dùng vẫn được giữ. Không có `context7`/`codebase-memory-mcp` trong phiên; API được đối chiếu bằng tài liệu chính thức và tài liệu đi kèm phiên bản cài.

**Bước tiếp theo: mở bản chạy local để duyệt giao diện trên điện thoại, rồi đo LCP trên preview trước khi quyết định phát hành.**
