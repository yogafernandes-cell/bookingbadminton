import { z } from "zod";

export const bookingLookupSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^BKM-[A-Z0-9-]{8,30}$/, "Kode booking tidak valid"),
  customerPhone: z.string().trim().regex(/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid"),
});
