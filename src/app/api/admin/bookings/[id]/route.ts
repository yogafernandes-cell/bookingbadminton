import { addHours } from "date-fns";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookingConflictError } from "@/modules/bookings/service";
import { resolveSlotPrice } from "@/modules/courts/pricing";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), date: z.iso.date(), times: z.array(z.string().regex(/^([01]\d|2[0-3]):00$/)).min(1).max(8) }),
]);

async function hasActiveAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const user = await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } });
  return Boolean(user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasActiveAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = schema.parse(await request.json());
    const { id } = await params;
    if (input.action === "cancel") {
      await db.$transaction([
        db.booking.update({ where: { id }, data: { status: "CANCELLED" } }),
        db.courtSlot.updateMany({ where: { bookingId: id }, data: { status: "AVAILABLE", bookingId: null, holdExpiresAt: null, blockedReason: null } }),
      ]);
      return NextResponse.json({ success: true });
    }

    const times = [...new Set(input.times)].sort();
    const startsAt = times.map((time) => new Date(`${input.date}T${time}:00+07:00`));
    if (startsAt.some((date) => Number.isNaN(date.getTime()) || date <= new Date())) throw new BookingConflictError("Jadwal baru harus berada di masa mendatang.");
    await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id }, include: { items: { orderBy: { startsAt: "asc" } } } });
      const courtId = booking?.items[0]?.courtId;
      if (!booking || !courtId) throw new BookingConflictError("Booking atau lapangan tidak ditemukan.");
      if (booking.status === "CANCELLED" || booking.status === "EXPIRED") throw new BookingConflictError("Booking ini tidak dapat dijadwalkan ulang.");
      const dayOfWeek = new Date(`${input.date}T12:00:00+07:00`).getUTCDay();
      const [court, hours, rules, currentSlots] = await Promise.all([
        tx.court.findFirst({ where: { id: courtId, isActive: true } }),
        tx.operatingHour.findUnique({ where: { dayOfWeek } }),
        tx.courtPriceRule.findMany({ where: { courtId, isActive: true } }),
        tx.courtSlot.findMany({ where: { courtId, startsAt: { in: startsAt } } }),
      ]);
      if (!court) throw new BookingConflictError("Lapangan tidak aktif.");
      const open = Number(hours?.opensAt.slice(0, 2)); const close = Number(hours?.closesAt.slice(0, 2));
      if (!hours?.isOpen || times.some((time) => Number(time.slice(0, 2)) < open || Number(time.slice(0, 2)) >= close)) throw new BookingConflictError("Jadwal berada di luar jam operasional.");
      const unavailable = currentSlots.some((slot) => slot.bookingId !== booking.id && (slot.status === "BOOKED" || slot.status === "BLOCKED" || (slot.status === "HELD" && (!slot.holdExpiresAt || slot.holdExpiresAt > new Date()))));
      if (unavailable) throw new BookingConflictError("Salah satu slot sudah digunakan.");
      const prices = times.map((time) => resolveSlotPrice(court.hourlyRate, rules, dayOfWeek, time));
      const subtotal = prices.reduce((total, price) => total.add(price), new Prisma.Decimal(0));
      const discount = Prisma.Decimal.min(booking.discountAmount, subtotal);
      const newTotal = subtotal.sub(discount);
      if (booking.paymentStatus === "VERIFIED" && !newTotal.equals(booking.totalAmount)) throw new BookingConflictError("Booking yang sudah lunas hanya dapat dipindahkan ke jadwal dengan total harga yang sama. Tangani selisih/refund terlebih dahulu.");
      await tx.courtSlot.updateMany({ where: { bookingId: booking.id }, data: { status: "AVAILABLE", bookingId: null, holdExpiresAt: null, blockedReason: null } });
      await tx.bookingItem.deleteMany({ where: { bookingId: booking.id } });
      await tx.booking.update({ where: { id: booking.id }, data: { totalAmount: newTotal, items: { create: startsAt.map((start, index) => ({ courtId, startsAt: start, endsAt: addHours(start, 1), price: prices[index] })) } } });
      for (const start of startsAt) await tx.courtSlot.upsert({ where: { courtId_startsAt: { courtId, startsAt: start } }, create: { courtId, startsAt: start, endsAt: addHours(start, 1), status: "BOOKED", bookingId: booking.id }, update: { endsAt: addHours(start, 1), status: "BOOKED", bookingId: booking.id, holdExpiresAt: null, blockedReason: null } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Data jadwal belum valid." }, { status: 422 });
    return NextResponse.json({ error: "Booking belum dapat diperbarui." }, { status: 500 });
  }
}
