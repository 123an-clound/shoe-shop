# Kế hoạch tối ưu điện thoại, máy tính bảng và bảo mật

Ngày khảo sát: **15/10/2026** · Mã nguồn: **65aa58d** · Next.js 16.3.8 / React 19 / Tailwind 4 / Supabase.

Đây là kế hoạch và baseline trước triển khai, dựa trên mã nguồn, bản build production tại localhost và khảo sát database chỉ đọc lúc lập kế hoạch. Kết quả triển khai ngày 15/10/2026 nằm trong [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md), gồm các gate còn mở. Giả định giữ stack, chức năng mua hàng, VI/EN, light/dark và khả năng đổi thương hiệu hiện có.

**Bắt đầu bằng gói 1: sửa tràn ngang, vùng chạm và checkout trên điện thoại.** Gói 2 cần hoàn thành trước khi mở bán công khai. Ước lượng toàn bộ: **7–10 ngày công cho một lập trình viên**, phụ thuộc việc có thiết bị thật, tài khoản test và môi trường staging. Đây là ước lượng, không phải cam kết lịch.

| Thứ tự | Gói công việc | Mức ưu tiên | Thời lượng dự kiến |
|---|---|---|---|
| 1 | Sửa lỗi sử dụng trên điện thoại/tablet | P0 | 1–2 ngày |
| 2 | Vá dependency và gia cố đường đặt hàng/auth | P0 trước mở bán | 1–2 ngày |
| 3 | Giảm LCP, JavaScript và chi phí hiệu ứng | P1 | 2 ngày |
| 4 | Hoàn thiện thị giác và tương tác theo thiết bị | P1 | 1–2 ngày |
| 5 | Kiểm chứng, đo lại và chuẩn bị phát hành | Bắt buộc | 2 ngày |

P0 là việc làm trước; không đồng nghĩa đã xác nhận một lỗ hổng Critical. Mỗi gói có bản thay đổi riêng, bằng chứng kiểm tra và khả năng hoàn tác.

**1. Sửa trải nghiệm điện thoại và tablet trước**

| ID | Việc cần làm | Vị trí chính | Tiêu chí nghiệm thu |
|---|---|---|---|
| M1 | Cho mô tả/URL/chuỗi dài xuống dòng; kiểm tra `min-width` ở grid và panel. Sửa đúng phần gây tràn, không che lỗi bằng `overflow-x:hidden` toàn trang. | `src/app/[locale]/san-pham/[slug]/page.tsx`, `src/components/ui/Tabs.tsx` | Trang sản phẩm VI/EN không tràn ngang ở 360–1180px; carousel thumbnail vẫn cuộn riêng bình thường. |
| M2 | Input trên điện thoại dùng chữ ít nhất 16px. Điện thoại dùng `type="tel"`, `inputMode="tel"`; khai báo autofill cho tên, điện thoại, email, địa chỉ. Khi chuyển bước/lỗi, đưa focus tới tiêu đề hoặc trường cần sửa. | `src/components/ui/Input.tsx`, `src/components/checkout/CheckoutForm.tsx`, form đăng nhập/liên hệ | Đúng bàn phím, autofill được; không mất dữ liệu khi quay lại bước trước; kiểm tra auto-zoom trên iOS thật. |
| M3 | Bổ sung safe area cho thanh thêm giỏ, drawer và toast; khoảng đệm nội dung tính theo chiều cao thanh thực tế. Tách nhãn hành động và giá nếu chiều ngang quá hẹp. Dùng chiều cao viewport động phù hợp cho sheet. | `AddToCartBar.tsx`, `Drawer.tsx`, layout storefront | Nút mua, giá, nội dung cuối trang không bị che; dùng được khi xoay ngang, mở bàn phím và phóng to chữ. |
| M4 | Hoàn thiện focus trap, trả focus về nút mở, ngăn tương tác nền và quản lý scroll lock. Thêm skip link; hoàn thiện phím mũi tên/Home/End cho tabs và nhóm chọn size/màu. | `MobileMenu.tsx`, `Drawer.tsx`, `Tabs.tsx`, `SizePicker.tsx`, `ColorPicker.tsx` | Tab/Shift+Tab ở trong modal; Escape đóng; focus về đúng nút mở, kể cả sau đổi route; không cuộn nền ngoài ý muốn. |
| M5 | Vùng chạm tối thiểu theo mục tiêu nội bộ 44×44px, ưu tiên 48px cho nút chính; tăng vùng bấm swatch màu và select sắp xếp. | `ColorPicker.tsx`, `ProductListing.tsx`, `FilterBar.tsx` | Chọn màu/size/bộ lọc bằng một tay không cần chạm chính xác; focus và trạng thái disabled rõ ràng. |

Bằng chứng hiện tại: swatch màu có kích thước CSS 36px, select sắp xếp cao 40px; các ô checkout đo được 14px. Không quy mọi nút dưới 44px thành lỗi WCAG tự động: đây là mục tiêu UX cho thiết bị cảm ứng của dự án.

**2. Gia cố bảo mật trước khi mở bán**

| ID | Việc cần làm | Vị trí/phạm vi | Tiêu chí nghiệm thu |
|---|---|---|---|
| S1 | Cập nhật dependency gián tiếp `source-map-js` 1.2.1 lên bản vá tương thích từ 1.2.2; cập nhật lockfile có kiểm soát. | `package-lock.json`, chuỗi Next/PostCSS/Tailwind | Advisory tương ứng hết xuất hiện; test, lint và build đạt. Không dùng `npm audit fix --force` hoặc nâng toàn bộ stack để xử lý một bản vá. |
| S2 | Thiết kế giới hạn tần suất và chống đơn rác ở đường ghi dùng chung trong database, kết hợp lớp bảo vệ request ở ứng dụng. Bao phủ cả ba RPC đặt hàng đang được `anon` gọi trực tiếp. Giữ retry bằng idempotency key, không tính retry hợp lệ thành đơn mới. | `src/lib/actions/orders.ts`, các hàm `veloce_place_order*`, migration chỉ thuộc shop | Trên staging: gọi trực tiếp Supabase vẫn chịu giới hạn; spam không trừ kho hàng loạt; retry hợp lệ chỉ có một đơn; khách COD không bắt buộc đăng nhập. |
| S3 | Rà giới hạn đăng nhập/OTP, contact và newsletter. Contact đã có giới hạn theo email; bổ sung lớp chống đổi email để vượt giới hạn nếu cần. Xác minh chính sách MFA cho admin và cấu hình session/provider thực tế. | Auth Supabase, actions auth/public forms | Chống thử mật khẩu/gửi OTP hàng loạt; thông báo lỗi không lộ tài khoản; MFA admin được kiểm thử với tài khoản staging trước khi bắt buộc. |
| S4 | Bổ sung/kiểm tra header bảo mật; bắt đầu CSP ở Report-Only, quan sát vi phạm rồi mới enforce. Rà `frame-ancestors`, `object-src`, `base-uri`, `form-action`, Referrer/Permissions Policy, nosniff; HSTS kiểm tra trên HTTPS thật. | `next.config.ts`, `src/proxy.ts`, root layout | Theme, inline script/style, Next hydration, ảnh/video Supabase và OAuth hoạt động. Header được xác minh trên preview và production, không chỉ localhost. |
| S5 | Thêm kiểm thử phân quyền theo vai trò: guest, khách A/B, admin; upload sai loại/quá cỡ, sửa giá từ client, receipt giả, đọc đơn người khác, xuất CSV và gọi trực tiếp RPC. | Server Actions, RLS, RPC và Storage | Không đọc/ghi dữ liệu ngoài quyền; tiền và kho vẫn do server quyết định; log không chứa OTP, receipt token, khóa hay dữ liệu khách đầy đủ. |

Lưu ý bắt buộc khi thiết kế S2: chỉ rate-limit Server Action hoặc domain website chưa bao phủ endpoint Supabase trực tiếp. Không thu hồi quyền đặt hàng guest một cách máy móc; bảo vệ tại đường xử lý chung, giữ tương thích các RPC hiện có. Ngưỡng giới hạn cần cân bằng IP dùng chung của mạng di động, session, số điện thoại và lưu lượng thực; không tin khóa định danh tùy ý do client gửi.

Lưu ý S4: CSP nonce theo request có thể buộc dynamic rendering và ảnh hưởng cache. Phải chọn nonce/hash phù hợp từng route theo tài liệu Next.js của phiên bản cài đặt, rồi đo lại. Không thêm CSP nghiêm ngặt ngay mà bỏ qua script khởi tạo theme, CSS variables thương hiệu và JSON-LD.

Nền tảng đang có cần giữ: `requireAdmin()` trong các action quản trị, Zod, RLS, transaction/khóa tồn kho, tính giá từ database, chống đơn trùng và cookie biên nhận HttpOnly. Không đổi kiến trúc auth chỉ để giảm một request.

**3. Tối ưu hiệu năng bằng số đo**

| ID | Việc cần làm | Vị trí chính | Tiêu chí nghiệm thu |
|---|---|---|---|
| P1 | Phân tích waterfall LCP ở hero và ảnh sản phẩm. Kiểm tra ảnh nguồn, crop riêng cho mobile, `sizes` theo chiều rộng hiển thị thật và DPR. Duy trì eager/high priority cho ảnh LCP; giảm tài nguyên cạnh tranh. | `Hero.tsx`, `Gallery.tsx`, `ProductCard.tsx`, `ScrollStory.tsx` | Ảnh rõ nhưng đúng cỡ; chỉ ảnh đầu quan trọng được ưu tiên; đổi màu/ảnh không tải lại ảnh gốc quá lớn. Bổ sung `sizes` cho ảnh story đang thiếu. |
| P2 | Phân tích bundle production rồi giảm phần JavaScript không cần lúc mở trang. Tải drawer/auth UI khi cần; giữ phần tĩnh ở server; tối ưu client boundary của motion và dữ liệu danh sách. | layout storefront, `CartDrawer.tsx`, `HeaderAccount.tsx`, `ProductListing.tsx`, components motion | Mục tiêu ban đầu cho trang chủ: JavaScript truyền tải ≤250KiB, so với baseline khoảng 330KiB; không mất SSR nội dung, giỏ hàng hoặc trạng thái tài khoản. |
| P3 | Mobile/coarse pointer dùng nền gradient tĩnh hoặc giảm Aurora; tablet kiểm tra cả blur của `.glass` và noise vì hiện chỉ giảm ở ≤640px. `Reveal`, `TiltCard`, grid, menu và drawer đều tuân thủ reduced motion. Chỉ tải GSAP khi hiệu ứng thật sự dùng. | `AuroraBackground.tsx`, `globals.css`, `Reveal.tsx`, `TiltCard.tsx`, `ProductResultsGrid.tsx`, `PageTransition.tsx` | Cuộn/chạm ổn định trên Android tầm trung; reduced motion không còn hiệu ứng di chuyển không thiết yếu; không rò listener/timeline khi đổi trang. |
| P4 | Tách dữ liệu dành cho card khỏi dữ liệu chi tiết thay vì `.select("*")` cho toàn danh sách. Xem lại dữ liệu RSC, fetch session lặp và xử lý ở proxy. Cache riêng dữ liệu public, giữ dữ liệu cá nhân `private/no-store`. | `src/lib/queries/products.ts`, `src/lib/supabase/middleware.ts`, `HeaderAccount.tsx` | Payload giảm có đo đếm; đăng nhập/đăng xuất/đổi tài khoản không hiện dữ liệu cũ; admin sửa giá/kho vẫn invalidation đúng. |
| P5 | Dùng skeleton có kích thước phù hợp, dự trữ chỗ ảnh/nội dung tải sau; giữ nội dung mua hàng hiển thị được khi animation chưa chạy. | product loading, `Reveal.tsx`, gallery/listing | CLS ≤0,1; không có vùng nội dung chính trống vì chờ animation; trang lỗi/mạng chậm có nút thử lại rõ ràng. |

Không kết luận Aurora là nguyên nhân duy nhất gây LCP chậm: baseline còn chỉ ra tài nguyên tải, JavaScript chưa dùng và CSS chặn render. Hero hiện đã có eager/high priority, nên việc chỉ thêm thuộc tính priority không giải quyết được toàn bộ vấn đề.

Native scrolling đã được giữ qua `SmoothScroll.tsx`; không bật lại Lenis hoặc thêm WebGL cho kế hoạch này. Danh sách hiện có 21 sản phẩm public: chưa cần virtualization hoặc hạ tầng tìm kiếm mới. Chỉ đưa phân trang/lọc server vào khi số lượng và số đo thực tế yêu cầu.

**4. Hoàn thiện thị giác và tương tác theo thiết bị**

Định hướng: shop giày với ảnh sản phẩm làm trọng tâm, nền tối và điểm nhấn thương hiệu hiện tại. Tăng độ rõ của tên, giá, màu/size và hành động mua; giảm chi tiết trang trí cạnh tranh với nội dung. Giữ font/token và các chế độ hiện có, không đổi thương hiệu theo gợi ý mặc định từ thư viện thiết kế.

| Khu vực | Điện thoại 360–599px | Tablet 600–1180px |
|---|---|---|
| Trang chủ | Kiểm tra crop hero để đôi giày còn đọc được; cân lại chiều cao hero và thứ bậc hai CTA; đưa lối tới sản phẩm sớm hơn nếu màn hình ngắn. | Bố cục riêng cho dọc/ngang; không coi tablet ngang là thiết bị có chuột. |
| Danh sách | Hai cột khi tên/giá vẫn đọc được ở 360px; tên card có giới hạn dòng hợp lý và vẫn giữ tên đầy đủ trong accessible name. | Hai hoặc ba cột theo chiều rộng nội dung, không chỉ theo breakpoint chung; đồng đều nhịp ảnh/tên/giá. |
| Bộ lọc | Bottom sheet có số kết quả, xóa lọc và nút hoàn tất luôn tìm thấy; trạng thái bộ lọc được đưa vào URL để Back/quay lại sản phẩm giữ lựa chọn. | Sheet/panel theo chiều rộng khả dụng; giữ điều khiển chạm đủ lớn cả khi sidebar xuất hiện. |
| Chi tiết sản phẩm | Giữ thumbnail rõ ràng; bổ sung vuốt/zoom chạm nếu đáp ứng performance, có nút thay thế; đổi ảnh không nuốt thao tác cuộn dọc. | Gallery và purchase panel chỉ chia đôi khi mỗi bên còn đủ rộng; hỗ trợ cảm ứng và chuột gắn ngoài. |
| Checkout và admin | Thông tin mua hàng chính và lỗi được ưu tiên; xem lại chiều cao khối tài khoản trước form. Admin sản phẩm có cách đọc/thao tác gọn thay cho bảng rộng. | Sidebar admin hiện chiếm 256px từ 768px: đánh giá thu gọn ở tablet dọc. Giữ bảng khi có đủ không gian; không làm mất thao tác sửa/xóa/xử lý đơn. |

Sửa token `text-fg-subtle` hoặc cách dùng trên nền tối: Lighthouse ghi nhận chữ thương hiệu ở chi tiết sản phẩm chỉ đạt tương phản **3,77:1** thay vì mức cần **4,5:1** cho cỡ chữ đó. Kiểm tra lại light/dark và các preset màu thương hiệu. Bổ sung rõ trạng thái đang chọn, hết hàng, đang gửi, gửi lỗi và thử lại; không dùng màu làm tín hiệu duy nhất.

Menu mở/đóng, chọn size và thêm giỏ cần phản hồi ngay; thời lượng micro-interaction dự kiến 150–250ms. Không để animation hoặc overlay làm chậm việc đọc giá và tiếp tục thanh toán. Với reduced motion, thay chuyển động bằng thay đổi trạng thái tức thời hoặc fade ngắn phù hợp.

**5. Kiểm chứng trước khi coi là hoàn thành**

| Nhóm kiểm tra | Phạm vi | Điều kiện đạt |
|---|---|---|
| Responsive | 360, 390, 430, 600, 768, 820, 1024, 1180, 1440px; VI/EN, light/dark, dọc/ngang; zoom 200% | Không tràn toàn trang, không che CTA, không mất thao tác. Cuộn ngang chỉ ở thành phần có chủ ý. |
| Luồng mua | Danh sách → lọc → chi tiết → màu/size → giỏ → checkout → COD thành công; thêm trường hợp mất mạng/retry, đổi tài khoản và giỏ cũ hết hàng | Không đơn trùng, không sai giá/kho, dữ liệu form được giữ phù hợp, lỗi có đường khôi phục. Đặt đơn thử chỉ trên staging. |
| Thiết bị/trình duyệt | Chromium và WebKit automation; iPhone Safari, Android Chrome tầm trung, iPad Safari và Android tablet thật | Bàn phím, safe area, viewport khi thanh địa chỉ thay đổi, touch và cuộn hoạt động. Emulation không thay thế hoàn toàn thiết bị thật. |
| Accessibility/motion | Axe/Lighthouse, bàn phím, VoiceOver/TalkBack; reduced motion; nhiều lần đổi route/mở drawer | Không lỗi a11y nghiêm trọng; focus rõ, không thoát modal, nội dung luôn tiếp cận được; không rò listener/timeline. |
| Security/performance | Unit/lint/build; DB/RLS tests trên môi trường biệt lập; audit dependency; Lighthouse mobile 3 lần/route trên preview cùng điều kiện | Không regression nghiệp vụ/phân quyền; không advisory High/Critical chưa xử lý hoặc chưa có đánh giá phạm vi rõ; đạt ngân sách bên dưới. |

Ngân sách nghiệm thu đề xuất:

| Chỉ số | Mục tiêu |
|---|---|
| Lighthouse mobile | Performance ≥90; Accessibility ≥95 và không có lỗi nghiêm trọng trong kiểm tra thủ công |
| LCP | ≤2,5 giây |
| INP | ≤200ms, thu thập từ tương tác và dữ liệu thực tế sau phát hành |
| CLS | ≤0,1 |
| TBT | ≤200ms trong Lighthouse; không dùng TBT để tuyên bố đã đạt INP |

Các ngưỡng LCP/INP/CLS dựa trên [Core Web Vitals](https://web.dev/articles/vitals), đánh giá thực tế ở phân vị 75 và tách nhóm thiết bị. Mục tiêu Lighthouse/JavaScript là ngân sách riêng đề xuất cho dự án. Ghi median của ba lần đo lab; kiểm tra cold/warm cache và mạng chậm. Chỉ tuyên bố đạt field metrics khi có đủ dữ liệu người dùng thật.

Giữ title/meta/canonical/OG, structured data, robots và sitemap trong kiểm tra hồi quy. Trước deploy public, chạy kiểm tra SEO page/technical trên preview theo quy ước dự án; không tự mở rộng thành full-site audit.

**Bằng chứng khảo sát hiện tại**

`npm test`: **44/44 đạt**. `npm run lint`: **đạt**. `npm run build`: **đạt**, gồm TypeScript. Đây là baseline mã nguồn hiện tại, không phải kết quả sau tối ưu.

| Lighthouse mobile, một lần đo mỗi route | Trang chủ `/` | Sản phẩm `/san-pham/aero-drift-low` |
|---|---:|---:|
| Performance | 79/100 | 83/100 |
| Accessibility | 100/100 | 97/100 |
| Best Practices | 100/100 | 100/100 |
| LCP mô phỏng | 5,56 giây | 4,66 giây |
| TBT | 80ms | 52ms |
| CLS | 0 | 0 |
| Tổng truyền tải | 789KiB | 674KiB |

Lighthouse **13.4.1**, production `next start`, localhost:3100; mobile 412×823, DPR 1,75; mạng và CPU mô phỏng với CPU slowdown 4×. Cache dữ liệu ứng dụng đã được làm ấm bởi build/khảo sát. Đây là số đo sơ bộ, không đại diện cho người dùng thật hay độ trễ server/CDN khi triển khai. Báo cáo không có `runtimeError` và không có run warning. CLI trả exit 1 ở bước dọn thư mục Chrome tạm trên Windows (`EPERM`) sau khi đã tạo báo cáo; không coi lệnh CLI này là đã kết thúc sạch.

Trang chủ: 18 request script, khoảng **330KiB JavaScript**, Lighthouse ước tính **106KiB** chưa dùng trong lần tải được đo. Đây là chẩn đoán tại thời điểm tải, không khẳng định toàn bộ phần đó có thể xóa. CLS hiện tốt, nên phải giữ ổn định layout khi cắt bundle/hiệu ứng.

| Kiểm tra chiều rộng trang | 360px | 768px | 1024px |
|---|---|---|---|
| Trang chủ, danh sách, giỏ, checkout, liên hệ | Không tràn | Không tràn | Không tràn |
| Chi tiết sản phẩm mẫu VI và EN | Tràn: scrollWidth 564px | Không tràn | Tràn: scrollWidth 1072px |
| Đăng nhập quản trị | Không tràn | Không tràn | Không tràn |

Kiểm tra thêm ở 390px: chi tiết sản phẩm vẫn có scrollWidth 564px; mô tả chứa chuỗi dài không ngắt là nguồn gây tràn đã xác định. Gallery thumbnail có vùng cuộn riêng có chủ đích, không phải nguyên nhân cần xóa. Ở mô phỏng touch 390px, layout viewport cũng bị nới theo nội dung tràn.

Đã chạy luồng chọn màu/size → thêm giỏ → tới checkout, không gửi đơn thật. Menu mobile: `Shift+Tab` từ nút đóng thoát ra ngoài dialog, xác nhận thiếu focus trap. Trong lần thử đó Escape vẫn đóng và focus đang ở nút mở do bước Shift+Tab trước, nên không dùng kết quả này để kết luận đã có cơ chế khôi phục focus đầy đủ.

Kiểm tra Supabase chỉ đọc: **9/9 bảng public có tiền tố `veloce_` bật RLS**; policy ghi/xóa Storage của shop yêu cầu admin. Các hàm đặt hàng public vẫn cho guest gọi đúng thiết kế; trong các thân hàm đã đọc chưa có cơ chế rate limit đặt hàng. Contact có giới hạn theo email. Những điểm này là quan sát cấu hình, chưa thay thế kiểm thử phân quyền/khả năng chống lạm dụng trên staging.

`npm audit --omit=dev`: **1 High**, `source-map-js` **1.2.1**, gián tiếp qua PostCSS/Next và toolchain Tailwind; có bản vá. [Advisory GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) mô tả DoS khi xử lý source map có cấu trúc bất thường; chưa xác nhận ứng dụng này cho người ngoài đưa source map tới đường xử lý đó. Vẫn nên vá dependency, không gọi đây là bằng chứng website đã bị khai thác.

Header trả từ localhost chưa có CSP, nosniff hay chính sách chống nhúng. Chưa biết nền tảng deploy có thêm header hay không. Tham chiếu khi triển khai: [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy) và [Supabase bảo vệ API](https://supabase.com/docs/guides/api/securing-your-api).

Báo cáo và ảnh:

- [Lighthouse trang chủ](artifacts/lighthouse-home-mobile.report.html) · [JSON](artifacts/lighthouse-home-mobile.report.json).
- [Lighthouse sản phẩm](artifacts/lighthouse-product-mobile.report.html) · [JSON](artifacts/lighthouse-product-mobile.report.json).
- [Trang chủ 390px](artifacts/audit-home-390.png) · [sản phẩm 390px](artifacts/audit-product-viewport-390.png).
- [Danh sách tablet 820px](artifacts/audit-listing-820.png) · [checkout 390px](artifacts/audit-checkout-390.png).

**Giới hạn và ràng buộc triển khai**

- Chưa kiểm tra iOS/Android/iPad vật lý, INP thực tế, FPS/GPU trên thiết bị yếu, mạng di động thật hoặc production CDN. Chưa có kết quả đạt các gate này.
- Chưa đăng nhập admin, thực hiện OAuth/OTP, tạo đơn, upload hay kiểm thử tải/tấn công vào database thật. Khu admin sau đăng nhập mới được đánh giá từ mã nguồn. Các test PostgreSQL/PGlite tùy chọn chưa chạy.
- Security gate còn mở vì dependency High và các hạng mục cần kiểm chứng; accessibility còn lỗi contrast/focus; performance chưa đạt mục tiêu LCP. Chưa coi dự án đã qua toàn bộ gate phát hành. Gate 3D không áp dụng vì không đề xuất WebGL.
- Không có công cụ `codebase-memory-mcp` hoặc `context7` trong phiên khảo sát. Đã dùng mã nguồn và tài liệu Next.js đi kèm bản cài, đối chiếu nguồn chính thức. Khi viết code, tra API đúng phiên bản trước khi áp dụng; không đoán từ kế hoạch này.
- Supabase dùng chung với ứng dụng khác: mọi migration chỉ tác động đối tượng shop `veloce_*` và policy bucket tương ứng; không seed lại hoặc đổi cấu hình auth toàn project khi chưa đánh giá ảnh hưởng. `PLAN.md` và README có một số thông tin project/provider cũ khác mã hiện tại: ghi nhận để xác minh trước triển khai, chưa sửa tài liệu gốc.

Không thay stack/font, không thêm 3D, không cache dùng chung đơn hàng/identity, không bỏ validation/RLS/idempotency để tăng điểm benchmark. Trước mỗi gói triển khai, công bố danh sách file sẽ sửa theo quy ước dự án; hoàn tất kiểm chứng của gói rồi mới chuyển tiếp.

**Bước tiếp theo cụ thể: mở gói 1 và triển khai M1 — sửa ngắt dòng mô tả sản phẩm, xác minh lại VI/EN ở 360px, 390px và 1024px.**
