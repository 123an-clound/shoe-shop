import { z } from "zod";

export const DEFAULT_SIZE_GUIDE = [
  { size: 39, cm: 24.5 },
  { size: 40, cm: 25.0 },
  { size: 41, cm: 25.5 },
  { size: 42, cm: 26.0 },
  { size: 43, cm: 26.5 },
  { size: 44, cm: 27.0 },
  { size: 45, cm: 27.5 },
];

export const sizeGuideSchema = z.array(z.object({
  size: z.number("Nhập size hợp lệ").int("Size phải là số nguyên").min(1, "Size phải lớn hơn 0").max(60, "Size tối đa là 60"),
  cm: z.number("Nhập chiều dài hợp lệ").positive("Chiều dài phải lớn hơn 0").max(50, "Chiều dài tối đa là 50 cm").multipleOf(0.1, "Chiều dài chỉ lấy 1 chữ số thập phân").optional(),
  cmMax: z.number().positive().max(50).multipleOf(0.1).optional(),
  label: z.string().trim().min(1).max(120).optional(),
})).min(1, "Thêm ít nhất 1 dòng hướng dẫn size").max(60, "Tối đa 60 dòng hướng dẫn size").superRefine((rows, context) => {
  const sizes = new Set<number>();
  rows.forEach((row, index) => {
    if (sizes.has(row.size)) {
      context.addIssue({ code: "custom", path: [index, "size"], message: "Size này đã có trong bảng" });
    }
    sizes.add(row.size);
    if (row.cm === undefined && !row.label) {
      context.addIssue({ code: "custom", path: [index, "cm"], message: "Nhập chiều dài hoặc nhãn size gốc" });
    }
    if (row.cmMax !== undefined && (row.cm === undefined || row.cmMax < row.cm)) {
      context.addIssue({ code: "custom", path: [index, "cmMax"], message: "Chiều dài tối đa phải lớn hơn hoặc bằng chiều dài tối thiểu" });
    }
  });
});

export type SizeGuideRow = z.infer<typeof sizeGuideSchema>[number];

/** Sản phẩm chưa có bảng riêng tiếp tục dùng thông số đang hiển thị trước đây. */
export function getSizeGuide(value: unknown): SizeGuideRow[] {
  const result = sizeGuideSchema.safeParse(value);
  return (result.success ? result.data : DEFAULT_SIZE_GUIDE).map((row) => ({ ...row })).sort((a, b) => a.size - b.size);
}

export { getSizeLabel, formatFootLength } from "./sizeLabels";
