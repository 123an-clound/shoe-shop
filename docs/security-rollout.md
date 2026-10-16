# Security rollout và vận hành

Trạng thái 2026-10-16 khoảng 07:00 +07: người dùng đã đồng ý rollout; **đã promote** `dpl_DUWBLgCtDTHeq8U1maWxWCQi1rhC` và **đã áp dụng** enforcement version `20261016000011`. Target API/domain chính và login/cookie/CSRF/logout/upload được kiểm lại thành công. Xem [20 control](security-review.md). Không seed/sửa schema app khác. Quy trình dưới đây lưu để vận hành, không chạy lại migration đã có.

## Chuyển traffic và siết quyền

1. Chọn candidate Ready, chạy `test:security:deployment`. Xác nhận `VELOCE_SECURITY_KEY` production là sensitive, hash DB khớp bằng phép so boolean, không in giá trị. Giữ credential admin trong secret store/local ignored.
2. Sau khi được phép phát hành, promote candidate đã thử:

   ```powershell
   vercel promote https://shoe-shop-48gsxe2pr-123an-clounds-projects.vercel.app --scope team_I3W98TxnWhXVBvO6X9xS8FVL
   ```

3. Migration `supabase/migrations/20261016000011_veloce_security_enforcement.sql` đã được áp dụng **một lần** sau promote tại `jtizooyjnllostamffpp`; không chạy lại với version khác. Nó revoke limiter cũ và yêu cầu server token khi insert/update public bucket. Local/test đã đồng bộ version remote thực, thay tên dự kiến cũ. Không dùng bulk `db push` cho project dùng chung chưa đối chiếu lịch sử.
4. Kiểm project target/alias qua API, không dựa riêng thông báo alias của `vercel inspect/deploy` staged. Xác nhận anon không gọi legacy limiter; admin không có trusted header không ghi public Storage được; login, upload hợp lệ, logout/replay vẫn đúng. Dùng object UUID riêng, cleanup, không sửa đơn/sản phẩm thật.
5. Ghi thời gian/deployment/version migration/evidence và đánh giá lại 20/20. Build xanh chưa đủ kết luận security-ready.

Rollback phải giữ tương thích DB: sau enforcement không promote app cũ thiếu key/limiter. Ưu tiên sửa/redeploy mới. Nếu bắt buộc khôi phục ACL cũ để cứu chức năng, ghi incident và rủi ro 02/07 mở lại, giới hạn thời gian và kiểm lại; không rollback toàn DB/seed.

## SSL/network dùng chung

**Đã áp dụng lúc khoảng 16:29 +07 ngày 2026-10-16**, sau khi người dùng xác nhận tất cả app chỉ dùng Supabase API: SSL enforcement `database:true`; allowlist chỉ một IPv4/32 và một IPv6/128 egress hiện tại của máy operator. Readback applied và khớp chính xác, không còn CIDR toàn Internet. Giá trị IP lưu ở `.cache/security/operator-network.json` bị Git/deploy ignore, không đưa vào docs.

Network restriction không áp dụng HTTPS API; smoke API/management query và login/logout/CSRF/cookie trên production sau thay đổi đều PASS. Chưa kiểm một direct SQL client có credential/TLS verify-full hoặc TCP probe từ mạng ngoài allowlist. Khi IP mạng/VPN đổi, cập nhật đúng /32 hoặc /128 qua Database Settings/Management API trước khi dùng SQL client/backup; app API vẫn hoạt động. Không mở Internet lại để chạy backup. Bật/thay SSL enforcement có reboot DB ngắn, đã theo dõi recovery ở lần thay này. Không tự suy allowlist rỗng là deny-all.

## Backup/restore

Người dùng đã chọn `C:\Users\phamt\OneDrive\Desktop\Web-projects\backup`. **Đã triển khai**, dữ liệu mã hóa nằm trong thư mục con `shoe-shop`; xem [cấu hình và cách khôi phục thử](security-backup.md). Lần đầu và lượt chạy nền đều hoàn tất, kiểm 18 bảng/31 function/20 policy/898 media; lượt nền không tải lại media. Task `ShoeShop-EncryptedBackup` chạy 03:00 theo giờ máy và chạy bù khi đăng nhập, giữ snapshot 30 ngày. Khóa DPAPI CurrentUser nằm ngoài OneDrive; ACL local chỉ user/SYSTEM/Administrators.

Máy phải bật/có mạng và user Windows này đã đăng nhập; có thể khóa màn hình. Giữ cả thư mục `runs` + `objects`, không tự xóa key local. Đã kiểm chạy nền bằng task tạm với đúng Limited/Interactive context, result 0; task tạm đã gỡ. Timer thực 03:00 tiếp theo chưa tới lúc kiểm. Mã hóa và khôi phục tại máy này đã chứng minh, **khóa phục hồi ngoài Windows profile, OneDrive sync hoàn tất, cảnh báo nhận thật và full Supabase disaster restore còn chưa kiểm**; không gọi 100% chỉ vì có lịch.

Mục tiêu: DB hằng ngày, media incremental, giữ 30 ngày, mã hóa khi truyền/lưu và tách khỏi app runtime. Local ACL không tạo ra immutable backup hoặc tách account ghi/xóa. RPO 24 giờ chỉ khả thi khi máy sẵn sàng, RTO 4 giờ toàn app **chưa chứng minh**; restore thử DB/media tại máy này khoảng 3 giây, không phải RTO toàn dịch vụ. Không mua gói hay chuyển dữ liệu sang đích khác.

Backup chỉ shop và các Auth user được FK shop tham chiếu, không toàn project. Snapshot có schema/rows/policies/functions/grants/triggers/indexes/constraints, manifest/hash media; phát hiện shape sequence/identity chưa hỗ trợ thì fail closed thay vì xuất thiếu. Dùng CLI Management API; không cần cài Docker/DB password, không dùng SQL server-side file/OS commands, không xuất dữ liệu app khác.

Restore vào môi trường riêng, tắt email/OTP/jobs thật. Khôi phục dependency/auth identity, RLS/function/media; đối chiếu counts/hash, đọc ảnh/video, thử guest/checkout giả/admin/customer isolation bằng fixture. Ghi tuổi/kích thước backup, thời gian restore và evidence đã che dữ liệu. Git và PGlite không thay bản backup dữ liệu thật.

## Monitoring/response

Log ứng dụng chỉ event/code/UUID/timestamp/service, không email/phone/password/token/cookie/body/SQL message. `PublicError` giữ business message kiểm soát; lỗi bất ngờ có mã hỗ trợ. Giữ audit đơn.

Cần chốt nơi thu log, role đọc, retention, owner/on-call. Vercel default high/critical alert và auto-subscribe chưa chứng minh app/auth alert. Cấu hình ngưỡng error/dependency/rate-limit tại hệ thống đã chọn, thử event không nhạy cảm và ghi evidence **nhận được**. Không gửi thử cho người khác khi chưa xác nhận người nhận/phạm vi.

Sự cố: ghi UTC/correlation ID, xem structured log bằng role đúng; không đưa payload ra issue/chat. Lộ key → revoke/rotate/redeploy và kiểm token cũ bị từ chối; xóa khỏi HEAD chưa đủ. Token bypass lộ trong phiên này đã rotate.

Signed-upload URL chỉ ghi private staging và có TTL provider; complete vẫn cần admin hiện hành/trusted request. Theo dõi dung lượng, dọn object mồ côi quá hạn bằng job chỉ ở `veloce-uploads`, giữ upload đang chạy và audit metadata. Chưa chọn scheduler/chưa cấu hình job dọn tự động.

## Kiểm tra lặp lại

```powershell
npm test
npm run test:db
npm run lint
npm run build
npm run test:e2e
npm run security:scan
npm audit --omit=dev
npm audit
```

Live probes riêng, không chạy trong `npm test`/CI thường. Target thuộc quyền quản lý, secrets qua env; không bật trace/screenshot có credential.

```powershell
$env:SECURITY_LIVE_TEST = '1'
$env:SECURITY_DEPLOYMENT_URL = 'https://<deployment-da-duoc-phep-kiem>'
# Nếu cần, VERCEL_AUTOMATION_BYPASS_SECRET lấy từ secret store, không in.
npm run test:security:deployment
npm run test:security:storage
```

Storage probe cần admin env/server key, dùng bản sao video có sẵn và file UUID, cleanup trong finally. Không save sản phẩm/tạo đơn; kiểm không còn object fixture sau test. Nếu cleanup lỗi chỉ xóa đúng fixture, không wildcard xóa media.

`npm run lint` qua guard braces. Còn 5 High dev advisory, production 0; dùng wrapper CI/editor, không đổi mitigation thành đã vá. Cập nhật tương thích khi upstream có patch, chạy lại regression.
