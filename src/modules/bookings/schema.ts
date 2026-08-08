import { z } from "zod";

export const createBookingSchema = z.object({
  customerName: z.string().trim().min(3).max(100),
  customerPhone: z.string().trim().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid"),
  notes: z.string().trim().max(500).optional(),
  promoCode: z.string().trim().min(3).max(30).optional(),
  courtId: z.string().cuid(),
  date: z.iso.date(),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):00$/)).min(1).max(8),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
