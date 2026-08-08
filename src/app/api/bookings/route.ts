import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { createBookingSchema } from "@/modules/bookings/schema";
import { BookingConflictError, createBooking } from "@/modules/bookings/service";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const input = createBookingSchema.parse(await request.json());
    const session = await getServerSession(authOptions);
    const user = session?.user?.email ? await db.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } }) : null;
    const booking = await createBooking(input, user?.role === "MEMBER" ? user.id : undefined);
    return NextResponse.json({ code: booking.code, paymentDueAt: booking.paymentDueAt }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data pemesanan belum valid.", fields: error.flatten().fieldErrors }, { status: 422 });
    if (error instanceof BookingConflictError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("create-booking", error);
    return NextResponse.json({ error: "Booking belum dapat diproses. Coba lagi." }, { status: 500 });
  }
}
