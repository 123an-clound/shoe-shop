# Backup mã hóa trên máy này

Đích người dùng chọn: `C:\Users\phamt\OneDrive\Desktop\Web-projects\backup`.
Dữ liệu shop nằm trong thư mục con **`shoe-shop`** để tách với các backup khác.

## Đã cấu hình và kiểm chứng

- AES-256-GCM cho database, manifest và từng file media; plaintext chỉ xử lý trong RAM, không ghi SQL/PII ra OneDrive.
- Khóa 32 byte do RNG tạo, được Windows DPAPI CurrentUser bảo vệ tại `%LOCALAPPDATA%\ShoeShopBackup\key.dpapi`, **ngoài OneDrive**. ACL thư mục backup/key chỉ cho user hiện tại, SYSTEM và Administrators; bỏ kế thừa quyền rộng.
- Task **`ShoeShop-EncryptedBackup`**, 03:00 hằng ngày theo giờ máy (Asia/Saigon), chạy bù khi đăng nhập. Cần máy bật, có mạng và tài khoản Windows này đang đăng nhập; không cần mở khóa màn hình. Không lưu Windows password; task chạy quyền Limited/Interactive và cửa sổ ẩn.
- StartWhenAvailable, yêu cầu mạng, không chạy trùng, tối đa 2 giờ, thử lại 2 lần cách 15 phút. Kiểm tra chu kỳ theo mốc 03:00, tránh việc backup thủ công chiều hôm trước làm bỏ lượt 03:00 hôm sau.
- Giữ snapshot 30 ngày, luôn giữ bản hoàn tất mới nhất. Media lưu chung theo hash nội dung, chỉ tải phiên bản thay đổi; chỉ xóa blob không được snapshot còn giữ tham chiếu, có thời gian đệm một ngày. Mốc tuổi lấy từ manifest đã xác thực, không tin timestamp trong summary có thể chỉnh tay.
- Lần đầu `20261016T094416Z`: hoàn tất 2026-10-16 16:47:46 +07, khoảng 210 giây; **18 bảng, 31 hàm, 20 policy, 898 file / 83.730.427 byte** được khôi phục/kiểm tra.
- Lượt nền Windows `20261016T095213Z`: hoàn tất 16:52:28 +07, tổng khoảng 15 giây, **0 file tải lại**, kiểm đủ 898 file. Task kiểm tra tạm đã gỡ; task hằng ngày giữ nguyên.
- `npm run backup:verify` độc lập: khôi phục DB từ archive vào PGlite trong RAM, kiểm typed rows/constraints/functions/policies/RLS, anon không đọc đơn; giải mã và kiểm SHA-256 toàn bộ media. Lượt cuối `20261016T100135Z` hoàn tất 17:01:50 +07, restore test **2,344 giây**, tổng 15 giây/0 file tải lại. Không ghi trở lại production.
- Task hằng ngày đã được Start-ScheduledTask thử, kết quả 0; lần timer kế tiếp lúc kiểm là **2026-10-17 03:00 +07**. Chưa giả định đã quan sát timer này thực sự chạy.

## Nội dung và phạm vi

15 bảng `public/private.veloce_*`, schema thực từ catalog, constraints/indexes/triggers/RLS/grants và 31 function shop. Kèm bản sao **chỉ những user Auth được FK của shop tham chiếu**, identities/MFA liên quan để giữ quan hệ khi khôi phục; không sao lưu các user/dữ liệu riêng của app khác. Nội dung nhạy cảm này chỉ nằm trong archive mã hóa, không được in log.

Toàn bộ object của bucket public `veloce` được kiểm phiên bản/metadata trước và sau lượt tải để tránh chấp nhận ảnh/video đang bị thay giữa chừng. Lượt tải mới dùng cacheNonce và kiểm ETag; mọi media còn được đối chiếu checksum nguồn để chặn CDN trả file cũ cùng dung lượng (MD5 chỉ đối chiếu ETag provider, archive dùng SHA-256/AES-GCM). Database rows được lấy trong một SELECT/MVCC snapshot. Row JSON lưu dạng text để tránh làm tròn bigint qua JavaScript; so sánh khôi phục theo kiểu PostgreSQL và không phụ thuộc thứ tự vật lý của hàng hoặc biểu diễn múi giờ.

Không phục hồi các auth session cũ hoặc counter rate-limit tạm; người dùng đăng nhập lại. Không giữ upload chưa công bố trong private quarantine `veloce-uploads`; file đang tải có thể tải lại. Không lưu OAuth/SMTP/JWT secrets của provider hay app secret `.env.local` vào archive. Những cấu hình đó cần thiết lập lại khi chuyển sang project mới.

## Các file cần giữ

- `runs/<UTC-run-id>/database.vbak`: snapshot DB đã mã hóa.
- `runs/<UTC-run-id>/manifest.vbak`: checksum, phạm vi và tham chiếu media, đã mã hóa/xác thực.
- `objects/<hash>.vbak`: file media đã mã hóa, có thể được nhiều snapshot dùng chung.
- `status.json` và `runs/*/summary.json`: trạng thái/tổng số đã che dữ liệu, không chứa dòng dữ liệu khách.
- `%LOCALAPPDATA%\ShoeShopBackup`: key, config, bản CLI 2.121.0 đã copy và đối chiếu SHA-256 với binary đang dùng; log/status local. Không đưa thư mục này vào Git/chat hoặc chia sẻ tự do.

Giữ **cả thư mục `shoe-shop`**, không chỉ copy một thư mục ngày rồi xóa `objects`. Không tự đổi/xóa `key.dpapi`. Nếu key/profile Windows bị mất, archive không giải mã được bằng cách chỉ tải lại OneDrive; cần xuất một bản khóa phục hồi độc lập trước khi đổi/cài lại máy. **Chưa thiết lập và kiểm thử khóa phục hồi trên máy khác.** Không tự lưu khóa thô cạnh archive để lách hạn chế này.

OneDrive có thể đồng bộ archive mã hóa theo cấu hình hiện có. Việc upload hoàn tất/quota/khôi phục phiên bản OneDrive chưa được kiểm chứng; kết quả hiện xác nhận file backup trên SSD và giải mã tại máy này. SSD hỏng/mất, ransomware hoặc tài khoản OneDrive bị xóa dữ liệu vẫn là giới hạn cần tính đến; đây chưa phải hệ thống backup bất biến ở một tài khoản khác.

## Chạy và kiểm tra

Trong terminal ở `shoe-shop`:

```powershell
npm run backup:run     # tạo snapshot ngay, tái sử dụng media không đổi
npm run backup:verify  # kiểm và khôi phục thử bản hoàn tất mới nhất trong RAM
Get-ScheduledTaskInfo -TaskName 'ShoeShop-EncryptedBackup'
Get-Content "$env:LOCALAPPDATA\ShoeShopBackup\status.json"
Get-Content "$env:LOCALAPPDATA\ShoeShopBackup\scheduler-status.json"
```

Nếu báo lock: kiểm có tiến trình backup đang chạy trước khi xử lý `run.lock`; không xóa lock của job còn sống. Job lỗi không đổi `latest.json` sang bản lỗi nên bản hoàn tất trước vẫn có thể kiểm/khôi phục. `scheduler-error.json` là dấu vết một lỗi cũ khi thử nghiệm, trạng thái hiện tại xem `scheduler-status.json`/`status.json`. Log không chứa SQL rows, email, password hay token.

## Email cảnh báo — đang chờ cấu hình người gửi

Người dùng đã chọn địa chỉ nhận; lưu tại `%LOCALAPPDATA%\ShoeShopBackup\email-recipient.json`. Chưa có thông tin đăng nhập SMTP nên **chưa gửi email thử, chưa xác nhận nhận mail**. Hai mục 04/20 vẫn UNVERIFIED. Không thay SMTP Auth dùng chung của Supabase.

Script hiện hỗ trợ SMTP cổng **587, bắt buộc STARTTLS**, kiểm chứng chỉ mặc định. Chọn dịch vụ gửi trước, rồi chạy PowerShell trực tiếp trên máy từ thư mục dự án:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\setup-email.ps1 -SmtpHost "TEN-MAY-CHU-SMTP" -Username "TAI-KHOAN-SMTP" -Sender "EMAIL-NGUOI-GUI"
```

Script yêu cầu mật khẩu bằng ô nhập ẩn; không nhập vào tham số lệnh, chat, Git, `.env` hay thư mục OneDrive. Thông tin SMTP lưu trong AppData với ACL user/system/admin, credential mã hóa Windows DPAPI CurrentUser; mất Windows profile cần cấu hình lại. Setup sẽ gửi đúng một email `[shoe-shop] test` tới địa chỉ đã duyệt. `smtpAccepted: true` trong `email-status.json` chỉ chứng minh SMTP nhận thư; kiểm cả Inbox/Spam rồi xác nhận đã thấy thư để có bằng chứng delivery.

Nếu chọn Gmail: [bật xác minh 2 bước và tạo mật khẩu ứng dụng](https://support.google.com/accounts/answer/185833?hl=vi), đặt tên riêng `shoe-shop alerts`. Dùng `smtp.gmail.com`, username/sender là tài khoản gửi Gmail. Một số tài khoản không cho tạo mật khẩu ứng dụng; khi đó cần dịch vụ khác. Không dùng mật khẩu đăng nhập chính.

Khi SMTP đã cấu hình, lỗi job gọi email `backup_failed` hoặc `backup_scheduler_failed`, chỉ chứa service/event/UTC/reference; không đính kèm backup, key, dữ liệu khách hay lỗi thô. Lỗi gửi được ghi đã che dữ liệu vào `email-status.json`; không đổi kết quả backup lỗi thành thành công. Chưa có monitoring website/auth, heartbeat độc lập khi máy offline hoặc credential hết hạn. Cần cấu hình và thử riêng các đường này. Native anomaly alerts Vercel không có trên Hobby theo [tài liệu](https://vercel.com/docs/alerts/configure-alerts).

Gửi thử lại sau khi đã cấu hình:

```powershell
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\scripts\backup\email.ps1 -Event test
```

Để gỡ lịch (chỉ khi muốn ngừng backup):

```powershell
Unregister-ScheduledTask -TaskName 'ShoeShop-EncryptedBackup' -Confirm:$false
```

Không tự chạy restore vào production. Trước sự cố, thử trên Supabase biệt lập với Auth/Storage chuẩn, cấu hình provider/secrets, re-issue session và kiểm luồng app. Bài test hiện dùng PGlite với scaffold Auth/Storage, kiểm row/schema/policy và media bytes; **chưa chứng minh khởi động toàn bộ Supabase/Auth/Storage trên một project mới hoặc RTO toàn ứng dụng**. Chưa gửi/thử nhận cảnh báo ngoài máy vì người dùng chưa chọn kênh.
