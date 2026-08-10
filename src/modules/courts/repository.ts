import "server-only";
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

export async function listActiveCourts(date = startOfDay(new Date())) {
  const dayOfWeek = new Date(`${date.toISOString().slice(0, 10)}T12:00:00+07:00`).getUTCDay();
  const [courts, operatingHour] = await Promise.all([db.court.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      slots: {
        where: { startsAt: { gte: date, lt: addDays(date, 1) }, status: { in: ["HELD", "BOOKED", "BLOCKED"] } },
        select: { id: true, status: true, holdExpiresAt: true },
      },
    },
  }), db.operatingHour.findUnique({ where: { dayOfWeek } })]);
  return { courts, operatingHour };
}
