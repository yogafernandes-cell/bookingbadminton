import { addHours } from "date-fns";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { manageScheduleSchema } from "@/modules/schedules/admin-schema";

async function hasActiveAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const admin = await db.user.findUnique({ where: { email: session.user.email }, select: { isActive: true } });
  return Boolean(admin?.isActive);
}

export async function POST(request: Request) {
  if (!(await hasActiveAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = manageScheduleSchema.parse(await request.json());
    const startsAt = [...new Set(input.times)].sort().map((time) => new Date(`${input.date}T${time}:00+07:00`));
    if (startsAt.some((value) => Number.isNaN(value.getTime()))) return NextResponse.json({ error: "Tanggal atau waktu tidak valid." }, { status: 422 });
    if (input.action === "block" && startsAt.some((value) => value <= new Date())) return NextResponse.json({ error: "Hanya jadwal masa depan yang dapat diblokir." }, { status: 422 });
    const result = await db.$transaction(async (tx) => {
      const court = await tx.court.findFirst({ where: { id: input.courtId, isActive: true }, select: { id: true } });
      if (!court) throw new Error("COURT_NOT_FOUND");
      const existing = await tx.courtSlot.findMany({ where: { courtId: court.id, startsAt: { in: startsAt } }, select: { startsAt: true, status: true } });
      if (input.action === "block") {
        if (existing.some((slot) => slot.status === "BOOKED" || slot.status === "HELD")) throw new Error("SLOT_UNAVAILABLE");
        for (const starts of startsAt) {
          await tx.courtSlot.upsert({ where: { courtId_startsAt: { courtId: court.id, startsAt: starts } }, create: { courtId: court.id, startsAt: starts, endsAt: addHours(starts, 1), status: "BLOCKED", blockedReason: input.reason }, update: { endsAt: addHours(starts, 1), status: "BLOCKED", blockedReason: input.reason, holdExpiresAt: null, bookingId: null } });
        }
        return startsAt.length;
      }
      const removed = await tx.courtSlot.deleteMany({ where: { courtId: court.id, startsAt: { in: startsAt }, status: "BLOCKED" } });
      return removed.count;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ success: true, count: result });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data jadwal belum valid.", fields: error.flatten().fieldErrors }, { status: 422 });
    if (error instanceof Error && error.message === "COURT_NOT_FOUND") return NextResponse.json({ error: "Lapangan tidak ditemukan atau sedang nonaktif." }, { status: 404 });
    if (error instanceof Error && error.message === "SLOT_UNAVAILABLE") return NextResponse.json({ error: "Ada slot yang sudah dibooking atau sedang ditahan pembayaran." }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return NextResponse.json({ error: "Jadwal sedang berubah. Coba lagi." }, { status: 409 });
    console.error("manage-schedule", error);
    return NextResponse.json({ error: "Jadwal belum dapat diperbarui." }, { status: 500 });
  }
}
