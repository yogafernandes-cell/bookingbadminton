import { z } from "zod";

const imageUrlSchema = z.union([
  z.string().trim().url(),
  z.string().trim().startsWith("/"),
]);

export const courtInputSchema = z.object({
  name: z.string().trim().min(3).max(60),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  floorType: z.string().trim().min(2).max(80),
  hourlyRate: z.coerce.number().int().min(10_000).max(1_000_000),
  imageUrl: imageUrlSchema.optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type CourtInput = z.infer<typeof courtInputSchema>;
