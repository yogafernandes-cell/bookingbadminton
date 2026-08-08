import "server-only";
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

export async function listActiveCourts() {
  const today = startOfDay(new Date());
  return db.court.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      slots: {
        where: { startsAt: { gte: today, lt: addDays(today, 1) }, status: { in: ["HELD", "BOOKED", "BLOCKED"] } },
        select: { id: true },
      },
    },
  });
}
