const vndFormatter = new Intl.NumberFormat("vi-VN");

/** Định dạng số tiền VND theo chuẩn "2.890.000₫" */
export function formatVND(amount: number): string {
  return `${vndFormatter.format(amount)}₫`;
}
