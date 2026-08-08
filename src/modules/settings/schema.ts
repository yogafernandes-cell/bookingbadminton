import { z } from "zod";

export const updateSettingsSchema = z.object({
  venueName: z.string().trim().min(3).max(100),
  address: z.string().trim().min(5).max(300),
  adminWhatsapp: z.string().trim().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid"),
  bankName: z.string().trim().min(2).max(60),
  bankAccountNumber: z.string().trim().regex(/^[0-9]{6,30}$/, "Nomor rekening hanya boleh berisi angka"),
  bankAccountHolder: z.string().trim().min(3).max(100),
  holdDurationMinutes: z.coerce.number().int().min(5).max(60),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
