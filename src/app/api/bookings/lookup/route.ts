import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { bookingLookupSchema } from "@/modules/bookings/lookup-schema";

const normalizePhone = (phone: string) => { const digits = phone.replace(/\D/g, ""); return digits.startsWith("0") ? `62${digits.slice(1)}` : digits; };

async function findBooking(code: string) {
  return db.booking.findUnique({
    where: { code },
    include: {
      items: { include: { court: { select: { name: true, floorType: true } } }, orderBy: { startsAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, rejectionReason: true, createdAt: true } },
    },
  });
}

export async function POST(request: Request) {
  try {
    const input = bookingLookupSchema.parse(await request.json());
    let booking = await findBooking(input.code);
    if (!booking || booking.customerPhone !== normalizePhone(input.customerPhone)) return NextResponse.json({ error: "Booking tidak ditemukan. Periksa kode dan nomor WhatsApp." }, { status: 404 });

    if (booking.status === "PENDING_PAYMENT" && booking.paymentDueAt <= new Date()) {
      await db.$transaction([
        db.courtSlot.updateMany({ where: { bookingId: booking.id, status: "HELD" }, data: { status: "AVAILABLE", bookingId: null, holdExpiresAt: null } }),
        db.booking.update({ where: { id: booking.id }, data: { status: "EXPIRED" } }),
      ]);
      booking = await findBooking(input.code);
      if (!booking) return NextResponse.json({ error: "Booking tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        code: booking.code,
        customerName: booking.customerName,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: Number(booking.totalAmount),
        paymentDueAt: booking.paymentDueAt.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        notes: booking.notes,
        items: booking.items.map((item) => ({ courtName: item.court.name, floorType: item.court.floorType, startsAt: item.startsAt.toISOString(), endsAt: item.endsAt.toISOString(), price: Number(item.price) })),
        latestPayment: booking.payments[0] ? { ...booking.payments[0], createdAt: booking.payments[0].createdAt.toISOString() } : null,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Kode booking atau nomor WhatsApp belum valid." }, { status: 422 });
    console.error("lookup-booking", error);
    return NextResponse.json({ error: "Status booking belum dapat diperiksa." }, { status: 500 });
  }
}
