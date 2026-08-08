import { z } from "zod";

export const manageScheduleSchema = z.object({
  action: z.enum(["block", "unblock"]),
  courtId: z.string().cuid(),
  date: z.iso.date(),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):00$/)).min(1).max(16),
  reason: z.string().trim().min(3).max(160).optional(),
}).superRefine((data, ctx) => {
  if (data.action === "block" && !data.reason) ctx.addIssue({ code: "custom", path: ["reason"], message: "Alasan blokir wajib diisi." });
});

export type ManageScheduleInput = z.infer<typeof manageScheduleSchema>;
