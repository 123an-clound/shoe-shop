import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Nhập họ tên"),
  customerPhone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Nhập địa chỉ giao hàng đầy đủ"),
  note: z.string().optional(),
  couponCode: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  size: z.number().int(),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const placeOrderInputSchema = checkoutFormSchema.extend({
  items: z
    .array(orderItemSchema)
    .min(1, "Giỏ hàng đang trống")
    .max(20, "Tối đa 20 dòng sản phẩm mỗi đơn"),
});

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
