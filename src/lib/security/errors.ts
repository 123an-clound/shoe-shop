import { securityEvent } from "./events";

/** Chỉ tạo từ thông báo nghiệp vụ/validation đã kiểm soát ở server. */
export class PublicError extends Error {}

const businessErrors = new Set([
  "Thiếu mã xác thực yêu cầu đặt hàng",
  "Mã yêu cầu đã được dùng với thông tin khác. Hãy kiểm tra đơn hàng trước khi đặt lại.",
  "Màu đã bị xóa hoặc không hợp lệ. Khôi phục biến thể trước khi hoàn kho.",
  "Size đã bị xóa hoặc không hợp lệ. Khôi phục biến thể trước khi hoàn kho.",
  "Tồn kho vượt giới hạn cho phép",
  "Danh sách màu không hợp lệ",
  "Không thể bỏ tồn kho theo biến thể sau khi đã phân bổ",
  "Size không được trùng nhau",
  "Màu không hợp lệ",
  "Mã màu không được trùng nhau",
  "Ảnh màu phải thuộc bộ ảnh sản phẩm",
  "Nhập tồn kho cho tất cả các màu",
  "Size và số lượng phải là số nguyên",
  "Size phải là số nguyên",
  "Size tồn kho không hợp lệ hoặc bị trùng",
  "Số lượng phải là số nguyên từ 0 trở lên",
  "Nhập tồn kho cho từng size",
  "Tổng tồn kho vượt giới hạn cho phép",
  "Tồn kho không được âm",
  "Giỏ hàng không hợp lệ",
  "Giỏ hàng đang trống",
  "Một đơn tối đa 20 dòng sản phẩm",
  "Họ tên không hợp lệ",
  "Số điện thoại không hợp lệ",
  "Địa chỉ không hợp lệ",
  "Số lượng mỗi sản phẩm phải từ 1 đến 10",
  "Sản phẩm không tồn tại",
  "Màu sản phẩm không hợp lệ",
  "Không có quyền quản trị",
  "Không tìm thấy đơn hàng",
  "Đơn này đã hủy rồi",
  "Đơn đã giao xong, không hủy được",
  "Trạng thái đơn không thể chuyển tiếp từ trạng thái hiện tại",
  "Đóng gói và nhập hãng vận chuyển, mã vận đơn trước khi giao hàng",
  "Chỉ đóng gói hoặc bỏ đánh dấu đóng gói đơn đã xác nhận",
  "Không thể chuyển trạng thái thanh toán này",
  "Chỉ ghi nhận hoàn tiền cho đơn đã thu tiền và đã hủy",
  "Dữ liệu cập nhật không hợp lệ",
  "Trường cập nhật không hợp lệ",
  "Dữ liệu đóng gói không hợp lệ",
  "Dữ liệu cập nhật phải là chuỗi",
  "Đơn hàng vừa thay đổi. Tải lại trang trước khi lưu tiếp",
  "Trạng thái cập nhật không hợp lệ",
  "Thanh toán không hợp lệ",
  "Không sửa vận chuyển của đơn đã kết thúc",
  "Nhập lý do hủy từ 3 đến 500 ký tự",
  "Đơn hàng vừa thay đổi. Tải lại trang trước khi hủy",
  "Xác nhận hàng đã về kho trước khi hủy đơn đang giao",
  "Đơn đã kết thúc, không thể hủy",
  "Vui lòng đăng nhập.",
  "Trang không hợp lệ.",
  "Biên nhận không hợp lệ.",
  "Thiếu mã yêu cầu.",
  "Yêu cầu đã được xử lý. Hãy kiểm tra đơn hàng trước khi đặt lại.",
  "Tài khoản đã thay đổi. Hãy kiểm tra đơn hàng trước khi đặt lại.",
  "Nhóm đơn không hợp lệ.",
  "Quá nhiều yêu cầu. Vui lòng chờ ít phút rồi thử lại.",
  "Email không hợp lệ",
  "Dữ liệu không hợp lệ",
  "Phiên đã hết hạn.",
  "Dữ liệu đặt hàng không hợp lệ.",
]);

export function databaseError(error: { code?: string; message?: string }): Error {
  const message = error.message ?? "";
  if (["P0001", "22023"].includes(error.code ?? "")) {
    if (businessErrors.has(message)) return new PublicError(message);
    // Chỉ nhận mẫu nghiệp vụ hữu hạn: tên sản phẩm công khai và số lượng.
    if (/^Sản phẩm "[^\r\n]{1,200}" (?:chỉ còn \d+ đôi|đã ngừng bán|không có size \d+)$/.test(message)
      || /^Màu [^\r\n]{1,100} size \d+ chỉ còn \d+ đôi$/.test(message)) {
      return new PublicError(message);
    }
  }
  return Object.assign(new Error("Database operation failed"), { code: error.code });
}

export function safeErrorMessage(error: unknown): string {
  if (error instanceof PublicError) return error.message;
  const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : undefined;
  const id = securityEvent("application_error", code);
  return `Không thể hoàn tất yêu cầu. Vui lòng thử lại. Mã hỗ trợ: ${id}`;
}
