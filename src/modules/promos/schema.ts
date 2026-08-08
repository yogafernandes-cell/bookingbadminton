import { z } from "zod";

export const promoInputSchema = z.object({
  name: z.string().trim().min(3).max(80),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.coerce.number().positive().max(1_000_000),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isActive: z.boolean(),
}).refine((value) => value.endsAt > value.startsAt, { message: "Periode promo tidak valid." }).refine((value) => value.type !== "PERCENTAGE" || value.value <= 100, { message: "Persentase maksimal 100%." });
