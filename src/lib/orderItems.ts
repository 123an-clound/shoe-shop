import { z } from "zod";
import type { Json } from "@/types/database";

const snapshotSchema = z.array(z.object({
  product_id: z.string().uuid(), slug: z.string(), name: z.string(),
  price: z.number().int().nonnegative(), image: z.string(),
  size: z.union([z.number(), z.string()]), color: z.string(), quantity: z.number().int().positive(),
  size_label: z.string().min(1).max(120).optional(),
})).min(1);

export function getOrderItems(value: Json) {
  const parsed = snapshotSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
