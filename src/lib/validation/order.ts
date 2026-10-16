import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z.string().trim().min(2, "Nhập họ tên").max(120, "Họ tên tối đa 120 ký tự"),
  customerPhone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .email("Email không hợp lệ").max(254, "Email tối đa 254 ký tự")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().min(5, "Nhập địa chỉ giao hàng đầy đủ").max(500, "Địa chỉ tối đa 500 ký tự"),
  note: z.string().max(2000, "Ghi chú tối đa 2.000 ký tự").optional(),
  couponCode: z.string().max(64, "Mã giảm giá tối đa 64 ký tự").optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  size: z.number().int(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  quantity: z.number().int().min(1).max(10),
});

export const placeOrderInputSchema = checkoutFormSchema.extend({
  expectedUserId: z.string().uuid().nullable(),
  idempotencyKey: z.string().uuid(),
  receiptToken: z.string().regex(/^[0-9a-f]{64}$/, "Biên nhận không hợp lệ"),
  items: z
    .array(orderItemSchema)
    .min(1, "Giỏ hàng đang trống")
    .max(20, "Tối đa 20 dòng sản phẩm mỗi đơn"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
