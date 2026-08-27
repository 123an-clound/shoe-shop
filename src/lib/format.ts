const vndFormatter = new Intl.NumberFormat("vi-VN");

/** Định dạng số tiền VND theo chuẩn "2.890.000₫" */
export function formatVND(amount: number): string {
  return `${vndFormatter.format(amount)}₫`;
}

/** "N phút/giờ/ngày trước" — dùng cho bảng điều khiển admin (mục 5.7 PLAN.md). */
export function formatTimeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
