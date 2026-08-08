import { z } from "zod";

export const submitPaymentSchema = z.object({
  customerPhone: z.string().trim().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/),
  senderName: z.string().trim().min(3).max(100),
  amount: z.coerce.number().positive(),
});
