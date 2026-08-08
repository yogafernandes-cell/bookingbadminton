import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await db.$transaction(async (tx) => {
    const expired = await tx.booking.findMany({
      where: { status: "PENDING_PAYMENT", paymentDueAt: { lte: now } },
      select: { id: true },
    });
    const ids = expired.map(({ id }) => id);
    if (ids.length === 0) return 0;

    await tx.courtSlot.updateMany({
      where: { bookingId: { in: ids }, status: "HELD" },
      data: { status: "AVAILABLE", bookingId: null, holdExpiresAt: null },
    });
    await tx.booking.updateMany({
      where: { id: { in: ids }, status: "PENDING_PAYMENT" },
      data: { status: "EXPIRED" },
    });
    return ids.length;
  });

  return NextResponse.json({ expiredBookings: result, processedAt: now.toISOString() });
}
