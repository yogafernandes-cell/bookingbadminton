import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const reviewSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("approve") }), z.object({ action: z.literal("reject"), reason: z.string().trim().min(5).max(300) })]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const input = reviewSchema.parse(await request.json());
    const payment = await db.payment.findFirst({ where: { id, status: "SUBMITTED", booking: { status: "PAYMENT_REVIEW" } }, select: { id: true, bookingId: true } });
    if (!payment) return NextResponse.json({ error: "Pembayaran sudah diproses atau tidak ditemukan." }, { status: 404 });
    const admin = await db.user.findUnique({ where: { email: session.user.email } });
    if (!admin?.isActive) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const reviewedAt = new Date();
    await db.$transaction([
      db.payment.update({ where: { id: payment.id }, data: { status: input.action === "approve" ? "VERIFIED" : "REJECTED", rejectionReason: input.action === "reject" ? input.reason : null, reviewedById: admin.id, reviewedAt } }),
      db.booking.update({ where: { id: payment.bookingId }, data: { status: input.action === "approve" ? "CONFIRMED" : "REJECTED", paymentStatus: input.action === "approve" ? "VERIFIED" : "REJECTED" } }),
      db.courtSlot.updateMany({ where: { bookingId: payment.bookingId }, data: { status: "BOOKED", holdExpiresAt: null } }),
    ]);
    return NextResponse.json({ success: true, status: input.action === "approve" ? "CONFIRMED" : "REJECTED" });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data verifikasi tidak valid." }, { status: 422 });
    console.error("review-payment", error);
    return NextResponse.json({ error: "Verifikasi belum dapat disimpan." }, { status: 500 });
  }
}
