import "server-only";
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

export async function getScheduleWindow(days = 7) {
  const from = startOfDay(new Date());
  const until = addDays(from, days);
  const [courts, operatingHours, slots] = await Promise.all([
    db.court.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.operatingHour.findMany(),
    db.courtSlot.findMany({ where: { startsAt: { gte: from, lt: until } }, select: { courtId: true, startsAt: true, status: true, holdExpiresAt: true } }),
  ]);
  return { courts, operatingHours, slots };
}
