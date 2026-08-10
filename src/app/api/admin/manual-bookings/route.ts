import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBookingSchema } from "@/modules/bookings/schema";
import { BookingConflictError, createBooking } from "@/modules/bookings/service";
export async function POST(request: Request) { const session = await getServerSession(authOptions); if (!session?.user?.email || !(await db.user.findFirst({ where: { email: session.user.email, role: "ADMIN", isActive: true }, select: { id: true } }))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); try { const body = await request.json(); const input = createBookingSchema.parse(body); const booking = await createBooking(input); const paid = body.paymentStatus === "PAID"; await db.$transaction([db.booking.update({ where: { id: booking.id }, data: { status: paid ? "CONFIRMED" : "PENDING_PAYMENT", paymentStatus: paid ? "VERIFIED" : "UNPAID" } }), db.courtSlot.updateMany({ where: { bookingId: booking.id }, data: { status: "BOOKED", holdExpiresAt: null } })]); return NextResponse.json({ id: booking.id, code: booking.code }); } catch (error) { if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 }); return NextResponse.json({ error: "Booking manual gagal dibuat." }, { status: 422 }); } }
