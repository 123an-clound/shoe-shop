import { z } from "zod";

export const contactMessageInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(10).max(4000),
  locale: z.enum(["vi", "en"]),
  website: z.string().max(200).optional(),
});

export const newsletterInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  locale: z.enum(["vi", "en"]),
});
