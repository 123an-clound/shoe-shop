# Security review — shoe-shop

## Kết quả

Đã đánh giá đủ **20/20** mục của skill `website-security-gate`: **6 PASS, 7 FAIL, 7 UNVERIFIED, 0 N/A**. Chưa đủ điều kiện kết luận bản phát hành an toàn. PASS dưới đây chỉ có giá trị trong môi trường và phạm vi bằng chứng được ghi; không xác nhận cấu hình production.

| Thông tin | Giá trị |
|---|---|
| Ngày đánh giá | 2026-10-16, Asia/Saigon |
| Dự án | `shoe-shop` / package `veloce-scaffold` |
| Commit được đánh giá | `47c0884b0659d37e66c00403b90bc5da7314efff` |
| Trạng thái ban đầu | Working tree sạch; lần kiểm tra này chỉ tạo báo cáo |
| Stack đã kiểm | Next.js 16.3.8, React 19.2.8, `@supabase/ssr` 0.12.5, `@supabase/supabase-js` 2.112.4 |
| Môi trường chạy | Windows, Node 24.15.0, npm 12.0.1; build production tại `http://127.0.0.1:3102`; Chrome headless cài trên máy |
| Database kiểm thử | PGlite 0.5.10, database tạm trong bộ nhớ, fixture riêng và SQL migration trong repo |
| Hạ tầng chưa xác minh | Deployment HTTPS, cấu hình Supabase Auth/DB/Storage đang chạy, WAF, backup, giám sát, quyền vận hành |

Phạm vi: mã nguồn ứng dụng, cấu hình Next.js, SQL tham chiếu và migrations, các kiểm thử hiện có, browser bundle vừa build, rà mẫu secret và HTTP/browser local. Server local sử dụng `.env.local`; các trang public có thể đọc dữ liệu Supabase qua luồng ứng dụng. Không gửi đơn thật, OTP, thử mật khẩu, upload, chạy migration, thay đổi tài khoản, DNS, WAF hay dữ liệu trên dịch vụ thật.

Nguồn schema ban đầu `_seed/sql/veloce_schema.sql:4` ghi một project cũ khác với project trong `CLAUDE.md`; không dùng file đó để khẳng định trạng thái database thật. PGlite mô phỏng `auth.uid()` và quyền admin bằng fixture, không kiểm chứng chữ ký JWT hoặc chính sách của Supabase Auth.

## Chuẩn và cách chấm

- Baseline: [website-security-gate](C:/Users/phamt/.agents/skills/website-security-gate/SKILL.md) và [20 controls](C:/Users/phamt/.agents/skills/website-security-gate/references/checklist.md). Đối chiếu thêm skill `supabase`, `code-security` và hướng dẫn kiểm thử `web-testing`.
- **PASS**: có bằng chứng đủ cho phạm vi ghi rõ. **FAIL**: có thiếu sót cụ thể trong mã/config được kiểm. **UNVERIFIED**: thiếu quyền truy cập, cấu hình hoặc phép thử cần thiết. **N/A**: chỉ dùng khi chức năng không tồn tại; dự án này không có mục nào đủ lý do loại trừ toàn bộ.
- Dùng OWASP ASVS **5.0.0** làm danh mục yêu cầu L1; xem thêm L2 về CSP và vòng đời phiên vì ứng dụng có tài khoản, đơn hàng và dữ liệu liên hệ. Đây không phải đánh giá đầy đủ hoặc chứng nhận ASVS.
- Các ID sau đã đọc trực tiếp từ JSON ASVS kèm skill: `V1.2.1` (encoding), `V1.2.4` (query an toàn), `V2.2.1` (validation), `V3.4.1` (HSTS), `V3.4.2` (CORS), `V3.4.3` (L2, CSP), `V5.2.1` (kích thước file), `V7.2.1` (xác minh token tại backend), `V7.3.1` (L2, idle timeout), `V8.2.1` (quyền chức năng), `V8.2.2` (quyền dữ liệu), `V12.2.1` (TLS). Không suy ra rằng tất cả yêu cầu này đã đạt.
- Nguồn OWASP: [ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0_release), các Cheat Sheet về HTTP Headers, File Upload, Logging và Input Validation trong bundle của skill. Tài liệu OWASP mang giấy phép [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); báo cáo ghi nhận kết quả riêng của dự án, không sao chép toàn bộ tiêu chuẩn.

## Threat model ngắn

| Thành phần | Nội dung |
|---|---|
| Tài sản | Phiên admin/khách, mật khẩu admin do provider giữ, biên nhận đơn, PII liên hệ/giao hàng, đơn/giá/tồn kho, nội dung và file Storage, nhật ký thao tác |
| Tác nhân | Khách vãng lai, khách đăng nhập A/B, admin, bot, người giữ token bị lộ, nhà cung cấp hosting/Supabase |
| Điểm vào | Server Actions; `/api/customer/session`; OAuth callback; export CSV admin; Supabase Auth/Data API/RPC/Storage truy cập trực tiếp bằng public key |
| Ranh giới tin cậy | Browser → Next.js → Supabase; JWT → `auth.uid()`; anon/authenticated → RLS; RPC `SECURITY DEFINER` → quyền owner; signed upload → bucket public |
| Lạm dụng chính | Tiêu quota nạn nhân, chiếm dụng tài nguyên bằng đơn/form/file, tái sử dụng biên nhận, IDOR, leo quyền admin, sửa giá, lộ lỗi/secret, XSS/CSRF, mất dữ liệu không khôi phục được |
| Kiểm soát hiện có | `getUser()`, `requireAdmin()`, Zod, RLS/ACL, giá và stock tại DB, idempotency, token biên nhận, counter DB, nonce và các security header |

Thanh toán hiện là COD/đối soát nội bộ, chưa có gateway hay webhook thanh toán; không kiểm thử chữ ký/replay webhook. Không suy từ bảo vệ ở Next.js rằng người gọi trực tiếp Supabase cũng bị cùng một lớp kiểm tra.

## Bảng đủ 20 điểm

Các mã E01–E10 dẫn tới phần bằng chứng và kết quả phía dưới. Các đường dẫn có số dòng là vị trí trong source tại commit được đánh giá.

| ID | Control | Status | Evidence | Fix hoặc phần còn phải kiểm |
|---|---|---|---|---|
| 01 | Hash mật khẩu bằng Argon2/bcrypt | **PASS** — thiết kế/provider | `src/lib/actions/auth.ts:26` chuyển xác minh mật khẩu cho Supabase Auth; ứng dụng không tự lưu mật khẩu. Provider công bố bcrypt với salt riêng trong [Password security](https://supabase.com/docs/guides/auth/password-security). | Không đọc password hash người dùng thật. Work factor thực tế, password policy, MFA và recovery của project chưa kiểm; không coi tài liệu provider là bằng chứng các cấu hình này đã bật. |
| 02 | Rate limit đăng nhập | **FAIL** — PGlite + static | E02/E07: DB có giới hạn 10 admin-login/email/15 phút, 3 OTP-send/email/10 phút, 10 OTP-verify/email/10 phút và 200 auth/phút/shop. Tuy nhiên RPC `veloce_check_auth_rate` cho anon gọi với email tùy ý (`20261015033947...sql:69`–84); 10 lời gọi anon tiêu hết quota nạn nhân, lời 11 bị chặn. | F01: chống việc người ngoài tiêu quota nạn nhân; kết hợp nguồn tin cậy và hạn chế theo nguồn/account. Giới hạn endpoint Supabase Auth trực tiếp, recovery và cách nhận IP qua proxy còn **UNVERIFIED**; app guard không bảo vệ được mọi endpoint provider. |
| 03 | Phiên phải hết hạn | **FAIL** — PGlite + static | `src/lib/customer/receipts.ts:11` chỉ đặt maxAge cookie 7 ngày. RPC đọc/claim tại `20261013090202...sql:55`–88 không so tuổi biên nhận. E07 tái hiện token có `created_at` cách 8 ngày vẫn đọc và claim được đơn. Auth dùng `getUser()` và signOut local. | F02: TTL/revocation tại trusted boundary cho guest receipt. Với Auth thật: kiểm JWT expiry, idle/absolute lifetime, refresh rotation, logout/revocation và token đã thu hồi trên endpoint bảo vệ; hiện **UNVERIFIED**. |
| 04 | Tắt debug, giữ log đã che dữ liệu | **UNVERIFIED** | Không thấy debug API riêng hoặc log token/password trong source ứng dụng đã rà. `src/app/error.tsx:14` vẫn `console.error(error)`; scripts upload log lỗi phục vụ vận hành. Nhật ký đơn tại migration order operations được giữ, không xóa. | Cần mẫu log production của lỗi/auth failure, redaction, quyền xem, retention và pipeline thu thập. Chưa ép lỗi trên dịch vụ thật; không kết luận console.error đang làm lộ secret. |
| 05 | Không để secret trong frontend | **PASS** — source + bundle local | E05: public JWT key có role `anon`; browser client chỉ dùng URL/public key (`src/lib/supabase/client.ts:5`). `.env.local` được Git ignore. 281 file text tracked, diff lịch sử trong phạm vi đã chọn và 47 JS browser bundle không khớp mẫu privileged secret; không có browser source map. Giá trị email/password admin local không xuất hiện trong các bundle. | Scanner mẫu không bao phủ mọi secret. Lịch sử file đã xóa/đổi tên ngoài danh sách hiện tại, reflog, log/cloud env và artifact ngoài repo chưa được kiểm đầy đủ. Nếu có bằng chứng lộ secret sau này, cần rotation và xử lý lịch sử. Không ghi giá trị credential vào báo cáo. |
| 06 | Không trả lỗi nội bộ chi tiết | **FAIL** — source | `src/lib/actions/orders.ts:51`–53 trả thẳng `error.message` từ RPC public. `src/lib/auth/requireAdmin.ts:32`–33 và nhiều action admin cũng chuyển nguyên message. Đây là kết quả action trả về, không được cơ chế che exception của Next.js tự lọc. | F03: allowlist/mã lỗi nghiệp vụ an toàn, lỗi khác trả thông báo chung + correlation ID; diagnostics server đã che dữ liệu. E06 thấy callback thiếu code trả `auth=error` an toàn; chưa tái hiện stack/SQL leak qua HTTP thật, không khẳng định đã bị khai thác. |
| 07 | Chặn định dạng upload nguy hiểm | **FAIL** — luồng source/config tham chiếu | Ảnh có allowlist WebP, magic bytes và path (`validation/image.ts:12`, `actions/products.ts:163`). Video có magic bytes nhưng signed upload vào bucket được dùng như public trước `completeProductVideoUpload` (`actions/productMedia.ts:8`–31); xác minh không phải điều kiện để object tồn tại. SQL bucket tham chiếu còn cho SVG (`_seed/sql/veloce_schema.sql:233`–239); migration video chỉ nối thêm MIME. | F04: quarantine/private staging, xác minh nội dung trước public hóa, xử lý file lỗi và siết MIME cần thiết tại Storage. Chỉ admin/signed token được upload theo source; không thấy anonymous arbitrary upload hoặc thực thi mã server. Policy/bucket thật và test upload từ chối chưa kiểm. |
| 08 | Giới hạn dung lượng upload | **UNVERIFIED** | `next.config.ts:13` giới hạn Server Action 6 MB; validator ảnh 5 MiB, video 50 MiB. E01 kiểm empty/oversized và E02 không đụng Storage. `20261012092512...sql:5` tăng bucket lên ít nhất 50 MiB; video upload trực tiếp không qua giới hạn body của Next.js. | Cần đọc file_size_limit/MIME bucket thật, giới hạn edge/storage/body/count/quota và test request quá giới hạn trên staging. Metadata size từ client không chứng minh file trực tiếp bị chặn; `greatest(...)` không đảm bảo bucket đúng 50 MiB nếu trước đó lớn hơn. |
| 09 | Validate lại tại server | **FAIL** — source + schema runtime | Zod tại action, DB kiểm stock/size/màu/giá, mapping field rõ ràng; unknown price/owner bị strip, admin patch strict. Nhưng `validation/order.ts:3`–15 không có max cho note/coupon/email; SQL đặt đơn truyền/lưu note mà không chặn chiều dài. E10: schema nhận note 1 MiB, coupon 10.000 ký tự. | F05: giới hạn từng field tại action và DB/RPC; test đường API trực tiếp, null/unknown field/privilege field. Không gửi payload lớn tới DB thật. Các kiểm thử đang xanh không bao phủ toàn bộ input và constraint của project live. |
| 10 | Chống IDOR, A không truy cập đơn B | **PASS** — PGlite + static | E02 customer-accounts: A/B/guest bị tách biệt, sai token không đọc/claim được, order base table và audit bị ẩn; không gắn đơn dựa trên phone/email. RPC dùng `auth.uid()` và projection bỏ PII/internal note (`20261013090202...sql:27`, `:40`, `:55`, `:70`). | PASS cho SQL/fixture được chạy; kiểm A/B thực qua HTTP/JWT, export, storage và policy đang triển khai vẫn cần trước release. TTL biên nhận là lỗi riêng ở 03. |
| 11 | User thường không làm admin | **PASS** — source + PGlite + HTTP guest | `requireAdmin.ts:8` kiểm `getUser()` và bảng admin; action ghi kiểm lại, layout dashboard kiểm riêng; export route cũng `requireAdmin()`. E02: non-admin không sửa/hủy/xem audit/summary; E06: guest vào `/admin` và export bị 307 tới login, không nhận CSV. | Proxy chỉ kiểm signed-in không phải lỗ hổng tự thân vì còn guard/policy phía sau. Chưa chạy HTTP với user thường/admin thật, chưa kiểm MFA; cần xác nhận quyền cả thao tác hợp lệ và bị từ chối trên staging. |
| 12 | Query DB có parameterization | **PASS** — rà đường query + tests | Actions/queries dùng `.eq`, `.insert`, `.update`, `.rpc` thay vì ghép SQL; các RPC business đã đọc dùng tham số/SQL tĩnh. `.or` tại `queries/adminOrderOperations.ts:24` dùng search được allowlist và cắt 60 ký tự ở `orderOperations.ts:26`. E01/E02 kiểm filter, unknown money patch và business rules. | Không thấy đường SQL injection trong phạm vi rà; không suy ra không thể có lỗi ở extension/function ngoài repo. Chưa fuzz mọi overload/RPC live; không nhầm `EXECUTE FUNCTION` của trigger với SQL động. |
| 13 | HTTPS bắt buộc | **UNVERIFIED** | Kết nối Supabase và remote image trong cấu hình dùng HTTPS. Không có bằng chứng certificate/redirect/HSTS của website triển khai; local HTTP không đại diện production. | Kiểm URL HTTPS thật: chain/expiry/hostname, redirect HTTP→HTTPS, HSTS và proxy trust; kiểm TLS kết nối dịch vụ/DB. Không tự bật preload/includeSubDomains khi chưa xác nhận phạm vi. |
| 14 | Security headers | **FAIL** — HTTP + Chrome production local | E06/E08: nosniff, DENY, Referrer/Permissions Policy hiện diện trên 200/404/redirect; X-Powered-By tắt. Nonce mới và khớp script. Nhưng `src/proxy.ts:18` chỉ trả **Content-Security-Policy-Report-Only**, không có CSP enforced; probe inline không nonce vẫn chạy trong Chrome. | F06: theo dõi vi phạm, thử compatibility rồi enforce CSP có chủ đích. Không coi header CSP gắn vào request nội bộ ở dòng 16 là response enforcement. HSTS xử lý ở 13; header edge/5xx và CSP trên deployment còn chưa kiểm. |
| 15 | Cookie HttpOnly + Secure + SameSite | **FAIL** — SDK/source, không phải Set-Cookie live | Guest receipt: HttpOnly/Lax/path `/`, Secure khi production. Auth SSR không truyền `cookieOptions` ở server/client/middleware. E09 chạy SDK cài sẵn với Auth mock: `httpOnly:false`, không `secure`, `sameSite:lax`, maxAge 34.560.000 giây. | F07: ít nhất kiểm/cấu hình Secure trên HTTPS. HttpOnly cần quyết định kiến trúc vì browser Supabase Auth cần token: [provider giải thích thiết kế](https://supabase.com/docs/guides/auth/server-side/advanced-guide). Không bật HttpOnly máy móc làm hỏng browser client. Theo checklist nghiêm ngặt mục này chưa đạt; chưa chứng minh XSS/chiếm phiên. Set-Cookie login thật, OAuth/CSRF còn **UNVERIFIED**. |
| 16 | CORS chỉ origin cần thiết | **PASS** — API Next.js local | E06: GET và OPTIONS `/api/customer/session` với origin local và `https://untrusted.invalid` đều không trả ACAO/ACAC; không phản chiếu Origin, không mở cross-origin credential access. GET giữ private/no-store và Vary Cookie. Cùng origin không cần ACAO. | PASS chỉ endpoint Next.js đã đo; 200/204 không đồng nghĩa browser được phép đọc cross-origin. Supabase Data/Auth/Storage có mô hình API riêng, cần kiểm policy/auth và phản hồi của dịch vụ đó; CORS không thay auth và không chặn direct HTTP. |
| 17 | DB không truy cập công khai ngoài ý muốn | **UNVERIFIED** | Source có RLS trên bảng shop, private receipt/idempotency/counters và Data API dùng anon. E02 xác minh denial ở fixture. Public Supabase API là kiến trúc có chủ đích, không phải bằng chứng DB bị mở trực tiếp. | Cần cấu hình network/admin API/exposed schemas, RLS/grants/views/functions thật, anonymous/cross-user denial. Không suy network isolation từ biến env hoặc báo cáo cũ. Không quét port production. |
| 18 | Quyền DB tối thiểu | **UNVERIFIED** | Runtime dùng anon/authenticated thay vì service-role. Migrations revoke private table/function và giới hạn admin action; E02 kiểm thao tác ngoài quyền bị từ chối. RPC guest SECURITY DEFINER cần thiết cho checkout, có validation và giới hạn. | Chưa đọc owner/BYPASSRLS/superuser/default grants/search_path/schema CREATE/EXECUTE toàn project live hoặc tách migration/admin identity. Cần kiểm từng public overload và view; không revoke guest checkout chỉ vì nó dùng SECURITY DEFINER. |
| 19 | Edge/CDN/WAF/DDoS tương đương Cloudflare | **UNVERIFIED** | Có dấu vết `.vercel` local nhưng không có cấu hình provider/rule/origin protection được xác minh. Không có cơ sở coi có CDN là đã có WAF/bot protection phù hợp. | Xác nhận hosting và biện pháp tương đương, origin bypass, giới hạn nguồn và alert; Cloudflare không bắt buộc. Không đổi DNS, mua gói hay tạo tài khoản trong lần kiểm tra này. |
| 20 | Backup tự động + giám sát lỗi | **UNVERIFIED** | Có source/migration trong Git và audit event đơn; chưa thấy bằng chứng restore hoặc pipeline cảnh báo được thử. Có thể provider có chức năng ngoài repo, chưa truy cập để xác nhận. | **Backup/restore:** lịch, retention, mã hóa/quyền tách biệt, RPO/RTO, restore cô lập cả DB và Storage, rollback/redeploy source. **Monitoring:** log đã che dữ liệu, alert lỗi/auth/abuse, owner/runbook, thử alert không nhạy cảm. Hai nhánh đều chưa kiểm; backup bật không đồng nghĩa khôi phục thành công. |

## Bằng chứng chạy lại trong phiên này

### E01–E04: kiểm thử, build và dependency audit

| Mã | Lệnh | Kết quả quan sát |
|---|---|---|
| E01 | `npm test` | Exit 0; **46/46 pass**, 0 skipped. Có validation ảnh/video, receipt, identity, filter, admin patch và CSV formula escaping. |
| E02 | `npm run test:db` | Exit 0; cả **4 script** product-inventory, order-operations, customer-accounts, abuse-protection hoàn tất. Không phải 4 assertion; mỗi script có nhiều kiểm tra. |
| E03 | `npm run lint` và `npm run build` | Cả hai exit 0. Build production/TypeScript hoàn tất. Đây là kiểm tra build hygiene, không chứng minh bảo mật. |
| E04a | `npm audit --json` | Exit 1: **5 High**, 0 Critical, cùng chuỗi dev dependency bên dưới. |
| E04b | `npm audit --omit=dev --json` | Exit 0: 0 advisory được npm trả về trong dependency production tại thời điểm chạy. Không phải chứng nhận không có CVE. |
| E04c | `npm ls next react @supabase/ssr @supabase/supabase-js braces micromatch --depth=5` | Xác nhận phiên bản cài và đường dependency thực tế. |

Chuỗi bị audit cảnh báo: `eslint-config-next@16.3.8 → @next/eslint-plugin-next@16.3.8 → fast-glob@3.3.1 → micromatch@4.0.8 → braces@3.0.3`. Năm package bị gắn High từ **một advisory gốc** [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) về stack-exhaustion DoS khi xử lý glob lồng sâu. Phạm vi quan sát là tooling lint/dev; chưa có bằng chứng pattern từ khách website tới sink này ở production. Cần cập nhật chain tương thích và chạy lại kiểm tra. Không chạy `npm audit fix --force`: đề xuất tự động đang trỏ tới downgrade major `eslint-config-next@14.2.35`, không thích hợp áp dụng mù quáng.

### E05: secrets và browser build

Đã chạy script Node chỉ xuất tên mục/đếm/kết quả, không xuất giá trị bí mật:

| Phạm vi | Kết quả |
|---|---|
| 281 file text do `git ls-files` chọn | Không khớp mẫu private-key PEM, `sb_secret_`, AWS access key, GitHub token, credential PostgreSQL URL hoặc JWT role service_role. |
| Diff của các đường dẫn đã chọn qua `git log --all -p --format=` | 22 commit reachable qua tất cả refs; không khớp các mẫu trên. Không phải quét trọn mọi blob/file đã xóa. |
| `.next/static` sau build | 47 file JS/map được xét; **0 source map**, không khớp các mẫu trên. |
| So sánh chính xác credential admin trong `.env.local` với JS browser | Email/password admin đều không khớp bundle. Các biến này không mang prefix NEXT_PUBLIC. |
| Public Supabase key | Chỉ decode metadata role để xác nhận `anon`; không ghi JWT. |

Đây là rà mẫu có giới hạn, không phải Gitleaks đầy đủ. `gitleaks`, `semgrep`, `zap` không có trong PATH; không cài hoặc khai báo đã chạy. Không rà credential store của máy. Không đưa file `.env.local`, giá trị cookie/token, password hay PII vào báo cáo.

### E06: HTTP trên bản production local

Khởi chạy bằng `npm run start -- --hostname 127.0.0.1 --port 3102`; probe bằng Node `fetch` với `redirect: 'manual'`. Các kết quả quan trọng:

| Request | Status và bằng chứng |
|---|---|
| `GET /en` | 200; nosniff/DENY/Referrer/Permissions Policy; private/no-store; CSP report-only; nonce khớp HTML. |
| `GET /en/security-review-missing` | 404; vẫn có các header trên và nonce. |
| `GET /admin/dang-nhap` | 200; có header bảo vệ và CSP report-only. |
| `GET /admin`, `GET /admin/don-hang/xuat` không cookie | 307 → `/admin/dang-nhap`; không nhận nội dung admin/CSV. Chưa đi tới nhánh 403 bên trong export handler. |
| `GET /api/customer/session` không cookie | 200; `Cache-Control: private, no-store`, Vary có Cookie; không có ACAO/ACAC. |
| `GET /api/auth/callback?next=https://untrusted.invalid` thiếu code | 307 tới đường giỏ hàng local cố định với `auth=error`; không redirect theo `next`. Cache private/no-store. Header Referrer quan sát cuối cùng là strict-origin-when-cross-origin từ cấu hình chung. |
| GET/OPTIONS session API, origin local và origin untrusted | GET 200 / OPTIONS 204; cả hai không ACAO/ACAC. Không mở cross-origin đọc dữ liệu. |
| `GET /` và `GET /san-pham` | 308 về chính path; khi follow redirects nhận `redirect count exceeded`. Ghi riêng ở phần vấn đề ngoài phạm vi. |

Hai lần GET `/en` cho CSP nonce khác nhau. Không response nào được đo có **CSP enforced** hoặc HSTS; HSTS vẫn UNVERIFIED cho HTTPS production, không chấm FAIL chỉ vì localhost HTTP.

Ví dụ lặp lại probe an toàn khi server local đang chạy:

```powershell
curl.exe -sS -D - -o NUL http://127.0.0.1:3102/en
curl.exe -sS -D - -o NUL http://127.0.0.1:3102/en/security-review-missing
curl.exe -sS -D - -o NUL http://127.0.0.1:3102/admin/don-hang/xuat
curl.exe -sS -D - -o NUL -H "Origin: https://untrusted.invalid" http://127.0.0.1:3102/api/customer/session
curl.exe -sS -D - -o NUL -X OPTIONS -H "Origin: https://untrusted.invalid" -H "Access-Control-Request-Method: GET" http://127.0.0.1:3102/api/customer/session
```

Không dùng cookie đăng nhập thật khi lưu output của các lệnh này.

### E07: tái hiện bổ sung trong PGlite

Chạy Node qua stdin (`node --input-type=module`), dùng fixture bootstrap ở `tests/order-operations-db.mjs:10`, tạo auth.users giả, áp dụng cùng migrations như `tests/abuse-protection-db.mjs` và migration customer accounts. Không chạy đoạn này trên Supabase thật.

1. Tạo một đơn fixture qua `veloce_place_order_with_receipt`, giữ token fixture 64 ký tự hex; đổi `private.veloce_order_receipts.created_at` thành `now() - interval '8 days'` bằng quyền fixture owner. Chuyển sang anon gọi `veloce_customer_receipt`: **vẫn trả đơn**. Chuyển sang authenticated A gọi `veloce_claim_customer_order`: **true**. Đây là tái sử dụng token đã giữ lại, không chứng minh đoán được token.
2. Chuyển anon; gọi `veloce_check_auth_rate('admin-login','victim@example.com')` 10 lần, không thực hiện login/password. Lần 11 lỗi **P0001**. `signInAdmin` gọi cùng counter trước xác minh password nên login action của identity đó sẽ bị chặn tới khi cửa sổ hết hạn nếu triển khai SQL này.

Output đã làm sạch của lần chạy hoàn tất exit 0:

```text
REPRODUCED: 8-day-old guest token still reads order.
REPRODUCED: 8-day-old guest token still claims order.
REPRODUCED: anonymous caller consumes victim login quota; call 11 denied P0001.
```

Lần chạy probe đầu tiên đã thấy các kết quả receipt nhưng assertion message tiếng Việt bị đổi encoding khi truyền stdin PowerShell, dẫn tới exit 1 ở bước rate-limit. Đã thay assertion bằng `{code: 'P0001'}` và chạy lại toàn bộ probe thành công; không tính lần lỗi harness là lỗi ứng dụng.

### E08–E10: Chrome, SDK cookie và validation

- **E08 / Chrome headless:** mở `/en` trên build production local, 200, nonce script khớp response; không có pageerror. Chèn script inline không nonce chỉ vào DOM của trang test: probe chạy được khi chỉ có CSP Report-Only. Không lưu nội dung vào database. Đây là thử enforcement CSP, không chứng minh có điểm XSS cho kẻ tấn công.
- **E09 / SDK Auth mock:** gọi `createServerClient` của package đang cài với `getAll/setAll`, mock HTTP Auth chỉ trong tiến trình và thực hiện `signInWithPassword` bằng user/token fixture. Thu được 1 cookie write: `httpOnly=false`, `secure` không đặt, `sameSite=lax`, `path=/`, `maxAge=34560000`. Không liên hệ provider cho login này và không thu được Set-Cookie thật trên HTTPS. Cookie maxAge không đại diện JWT TTL.
- **E10 / Zod runtime:** `node --import tsx --input-type=module`, import `placeOrderInputSchema`; payload fixture có note 1.048.576 ký tự và coupon 10.000 ký tự vẫn parse thành công; các field chèn `total` và `customer_user_id` bị loại. Không gửi payload này qua mạng hoặc lưu vào DB.

## Phát hiện và thứ tự xử lý

| Mã | Ưu tiên | Đường truy cập và ảnh hưởng | Hành động / tiêu chí kiểm lại |
|---|---|---|---|
| F01 | P1 | Anon → RPC auth-rate với email nạn nhân → counter chung với login action. Có thể gây từ chối đăng nhập tạm thời, không phải bypass mật khẩu. | Giữ rate limiting nhưng tránh RPC cho người ngoài tự tiêu quota nạn nhân; thiết kế theo account và nguồn tin cậy, kiểm cả direct Auth, proxy/multi-instance. Test traffic khác nguồn và login hợp lệ sau abuse. |
| F02 | P1 | Người đã có guest receipt token → RPC read/claim; server không từ chối token cũ. Ảnh hưởng thời gian truy cập đơn và khả năng gắn đơn, không phải lộ token tự động. | Định nghĩa TTL/revocation ở DB cho cả read và claim, đồng bộ UX 7 ngày; test trước/sau expiry, claimed token, logout và quyền owner. |
| F03 | P2 | Khách → placeOrder → RPC lỗi bất kỳ → message trả nguyên văn; admin actions có cùng pattern. Có nguy cơ lộ chi tiết provider/schema khi lỗi không thuộc nghiệp vụ dự kiến. | Mapping mã lỗi được phép hiển thị; các lỗi khác thông báo chung/correlation ID. Inject lỗi nội bộ giả trong test và xác nhận không có path/SQL/token. |
| F04 | P2 | Admin/signed upload → Storage public → bước xác minh video diễn ra sau upload; người giữ quyền upload có thể bỏ qua bước complete. MIME bucket tham chiếu còn SVG. | Kiểm bucket live, thu hẹp loại file, dùng staging private/quarantine rồi xác minh trước publish; test MIME giả, polyglot/path, quyền upload và file lỗi không truy cập public. Không tự đổi kiến trúc trong lượt báo cáo. |
| F05 | P2 | Guest checkout → schema → RPC/JSON hashing/lưu note không có giới hạn field phù hợp. Có thể tiêu tài nguyên dù có body limit và quota số đơn. | Bổ sung max cho note/coupon/email và các trường liên quan ở server/DB; test cả action và RPC trực tiếp với payload sát/vượt ngưỡng. |
| F06 | P2 | Response document → CSP Report-Only không chặn script. Nonce tồn tại chưa tạo thành biện pháp cưỡng chế. | Thu thập vi phạm đã làm sạch, kiểm Next.js hydration/auth/media/mobile và chuyển sang CSP enforced khi tương thích; test inline không nonce bị chặn, chức năng hợp lệ vẫn chạy. |
| F07 | P2 | Auth cookie mặc định của SDK browser/SSR không đạt đầy đủ HttpOnly/Secure theo checklist. Browser-token là lựa chọn thiết kế provider, cần ghi rõ rủi ro và các lớp giảm thiểu. | Xác minh cookie thật trên HTTPS, Secure, scope, SameSite và CSRF. Nếu yêu cầu HttpOnly bắt buộc, đánh giá auth chỉ ở server/BFF để tránh phá browser Auth; quyết định chấp nhận rủi ro không đổi FAIL thành PASS. |

Dependency High ở E04 là rủi ro supply chain/tooling bổ sung, không ép thành một mục thứ 21 hoặc coi là 5 lỗ hổng độc lập của website. Không chỉnh dependency/source/SQL trong lần kiểm tra này.

## Những phần chưa kiểm chứng và bằng chứng cần bổ sung

1. **Auth/session thật:** cấu hình rate limit cho direct Auth, IP/proxy trust, OTP/recovery/MFA, password policy; hai khách A/B và admin riêng; JWT hết hạn/đã revoke, refresh rotation, cookie HTTPS, OAuth và CSRF. [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits) có cơ chế provider riêng; [session settings](https://supabase.com/docs/guides/auth/sessions) phải kiểm trên project cụ thể.
2. **Database/Storage đang chạy:** migration history/schema drift, toàn bộ RLS/grants/owner/SECURITY DEFINER/search_path/view, network restrictions, object policy và file_size_limit/MIME. Cần thử allowed/denied upload có giới hạn trên staging với fixture được dọn theo kế hoạch; không dùng dữ liệu khách thật.
3. **Deployment/edge:** domain và deployment đúng commit, TLS/redirect/HSTS, header trên success/error/redirect/static, CSP enforced/compatibility, cache isolation, WAF/bot/origin bypass. Không lấy hiện diện `.vercel` hoặc localhost header làm bằng chứng production.
4. **Vận hành/khôi phục:** log đã che dữ liệu, ACL/retention, backup DB và Storage độc lập, lịch/RPO/RTO, restore cô lập, source/deployment recovery, alert thử nghiệm và người chịu trách nhiệm.
5. **Kiểm thử mở rộng:** chưa chạy toàn bộ E2E UI suite, mọi flow auth/admin trên browser, fuzz tất cả public RPC, quét secret toàn bộ lịch sử kể cả file đã xóa, SAST/DAST hoặc load test. Các test unit/DB, HTTP và browser nêu trên thực sự đã chạy; không gộp các mục bỏ qua thành PASS.

Các gate thiết kế, motion, accessibility, SEO và Web Vitals không được đánh giá lại vì chỉ tạo báo cáo bảo mật, không sửa giao diện hoặc chuẩn bị deploy. Không có codebase-memory/context7 tool trong phiên này; không sửa code dùng API mới. Đã đối chiếu package cài sẵn, docs Next.js kèm package và tài liệu Supabase chính thức cho nhận định liên quan.

## Bằng chứng cũ và vấn đề ngoài phạm vi

`OPTIMIZATION_REPORT.md` ngày 2026-10-15 ghi rằng migration abuse-protection đã áp dụng và advisor/ACL từng được kiểm trên Supabase thật. Đó là **bằng chứng lịch sử**, không được chạy lại bằng kết nối quản trị trong lần này. Không dùng nó nâng 17/18 lên PASS; trạng thái provider đăng nhập trong README cũng không được coi là cấu hình hiện tại đã xác nhận.

Phát hiện thêm trên bản production local: `/` và `/san-pham` trả 308 về chính đường dẫn, follow redirect bị lặp; `/en` vẫn 200. Đã tái hiện bằng HTTP, chưa xác định nguyên nhân; không khẳng định tương tự trên deployment. Để nguyên source vì yêu cầu hiện tại là kiểm tra và ghi báo cáo. Cần điều tra routing/rewrite riêng trước phát hành; do đó chưa kiểm toàn bộ luồng storefront tiếng Việt.

**Bước tiếp theo:** xử lý F01 và F02 bằng thay đổi có regression test trong môi trường biệt lập; sau đó thu thập bằng chứng staging cho các mục UNVERIFIED. Báo cáo này không phải phê duyệt deploy.
