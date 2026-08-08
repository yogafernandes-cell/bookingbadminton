import "server-only";
import { randomBytes } from "node:crypto";
import { addMinutes, addHours } from "date-fns";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { CreateBookingInput } from "./schema";
import { calculatePromoDiscount } from "@/modules/promos/service";

export class BookingConflictError extends Error {}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export async function createBooking(input: CreateBookingInput, userId?: string) {
  const times = [...new Set(input.times)].sort();
  const startsAt = times.map((time) => new Date(`${input.date}T${time}:00+07:00`));
  if (startsAt.some((date) => Number.isNaN(date.getTime()) || date <= new Date())) throw new BookingConflictError("Jadwal sudah lewat. Pilih waktu lain.");

  try {
    return await db.$transaction(async (tx) => {
      const [court, settings, operatingHour] = await Promise.all([
        tx.court.findFirst({ where: { id: input.courtId, isActive: true } }),
        tx.setting.findUnique({ where: { id: 1 } }),
        tx.operatingHour.findUnique({ where: { dayOfWeek: new Date(`${input.date}T12:00:00+07:00`).getUTCDay() } }),
      ]);
      if (!court) throw new BookingConflictError("Lapangan tidak ditemukan atau sedang nonaktif.");
      if (!operatingHour?.isOpen) throw new BookingConflictError("Arena tutup pada tanggal tersebut.");
      const openingHour = Number(operatingHour.opensAt.slice(0, 2));
      const closingHour = Number(operatingHour.closesAt.slice(0, 2));
      if (times.some((time) => Number(time.slice(0, 2)) < openingHour || Number(time.slice(0, 2)) >= closingHour)) throw new BookingConflictError("Waktu berada di luar jam operasional.");

      const existingSlots = await tx.courtSlot.findMany({ where: { courtId: court.id, startsAt: { in: startsAt } } });
      const now = new Date();
      const unavailable = existingSlots.some((slot) => slot.status === "BOOKED" || slot.status === "BLOCKED" || (slot.status === "HELD" && (!slot.holdExpiresAt || slot.holdExpiresAt > now)));
      if (unavailable) throw new BookingConflictError("Salah satu jadwal baru saja diambil. Silakan pilih ulang.");

      const paymentDueAt = addMinutes(now, settings?.holdDurationMinutes ?? 15);
      const subtotal = new Prisma.Decimal(court.hourlyRate).mul(times.length);
      const promoCode = input.promoCode?.toUpperCase();
      const promo = promoCode ? await tx.promo.findFirst({ where: { code: promoCode, isActive: true, startsAt: { lte: now }, endsAt: { gte: now } } }) : null;
      if (promoCode && !promo) throw new BookingConflictError("Kode promo tidak aktif atau sudah berakhir.");
      const discountAmount = promo ? calculatePromoDiscount(promo, subtotal) : new Prisma.Decimal(0);
      if (promo && discountAmount.isZero()) throw new BookingConflictError("Minimal transaksi untuk promo ini belum terpenuhi.");
      const booking = await tx.booking.create({
        data: {
          code: `BKM-${input.date.replaceAll("-", "").slice(2)}-${randomBytes(4).toString("hex").toUpperCase()}`,
          customerName: input.customerName,
          customerPhone: normalizePhone(input.customerPhone),
          userId,
          notes: input.notes || null,
          promoCode: promo?.code ?? null,
          discountAmount,
          totalAmount: subtotal.sub(discountAmount),
          paymentDueAt,
          items: { create: startsAt.map((start) => ({ courtId: court.id, startsAt: start, endsAt: addHours(start, 1), price: court.hourlyRate })) },
        },
      });

      for (const start of startsAt) {
        await tx.courtSlot.upsert({
          where: { courtId_startsAt: { courtId: court.id, startsAt: start } },
          create: { courtId: court.id, startsAt: start, endsAt: addHours(start, 1), status: "HELD", holdExpiresAt: paymentDueAt, bookingId: booking.id },
          update: { endsAt: addHours(start, 1), status: "HELD", holdExpiresAt: paymentDueAt, bookingId: booking.id, blockedReason: null },
        });
      }
      return booking;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof BookingConflictError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2002" || error.code === "P2034")) throw new BookingConflictError("Jadwal baru saja berubah. Silakan pilih ulang.");
    throw error;
  }
}
