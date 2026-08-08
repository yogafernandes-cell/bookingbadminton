import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { convertPaymentProofToWebp } from "@/lib/image";
import { isSupabaseStorageConfigured, removePaymentProof, uploadPaymentProofWebp } from "@/lib/supabase-storage";
import { submitPaymentSchema } from "@/modules/payments/schema";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
const normalizePhone = (phone: string) => { const digits = phone.replace(/\D/g, ""); return digits.startsWith("0") ? `62${digits.slice(1)}` : digits; };

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  if (!isSupabaseStorageConfigured()) return NextResponse.json({ error: "Supabase Storage belum dikonfigurasi oleh admin." }, { status: 503 });

  try {
    const { code } = await params;
    const formData = await request.formData();
    const input = submitPaymentSchema.parse({ customerPhone: formData.get("customerPhone"), senderName: formData.get("senderName"), amount: formData.get("amount") });
    const file = formData.get("proof");
    if (!(file instanceof File)) return NextResponse.json({ error: "Pilih file bukti pembayaran." }, { status: 422 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Format harus JPG, PNG, atau WebP." }, { status: 415 });
    if (file.size <= 0 || file.size > maxFileSize) return NextResponse.json({ error: "Ukuran gambar maksimal 5 MB." }, { status: 413 });

    const booking = await db.booking.findUnique({ where: { code } });
    if (!booking || normalizePhone(input.customerPhone) !== booking.customerPhone) return NextResponse.json({ error: "Kode booking atau nomor WhatsApp tidak cocok." }, { status: 404 });
    if (!['PENDING_PAYMENT', 'REJECTED'].includes(booking.status)) return NextResponse.json({ error: "Bukti pembayaran tidak dapat diunggah pada status ini." }, { status: 409 });
    if (booking.status === "PENDING_PAYMENT" && booking.paymentDueAt <= new Date()) {
      await db.$transaction([
        db.courtSlot.updateMany({ where: { bookingId: booking.id, status: "HELD" }, data: { status: "AVAILABLE", bookingId: null, holdExpiresAt: null } }),
        db.booking.update({ where: { id: booking.id }, data: { status: "EXPIRED" } }),
      ]);
      return NextResponse.json({ error: "Waktu pembayaran sudah habis." }, { status: 410 });
    }
    if (input.amount !== Number(booking.totalAmount)) return NextResponse.json({ error: "Nominal transfer harus sama dengan total pembayaran." }, { status: 422 });

    let webp: Buffer;
    try {
      webp = await convertPaymentProofToWebp(Buffer.from(await file.arrayBuffer()));
    } catch {
      return NextResponse.json({ error: "File gambar rusak atau formatnya tidak didukung." }, { status: 415 });
    }
    const uploaded = await uploadPaymentProofWebp(webp, booking.id);
    try {
      await db.$transaction([
        db.payment.create({ data: { bookingId: booking.id, senderName: input.senderName, amount: input.amount, proofUrl: uploaded.path, proofPublicId: uploaded.path, status: "SUBMITTED" } }),
        db.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_REVIEW", paymentStatus: "SUBMITTED" } }),
        db.courtSlot.updateMany({ where: { bookingId: booking.id }, data: { status: "BOOKED", holdExpiresAt: null } }),
      ]);
    } catch (error) {
      await removePaymentProof(uploaded.path).catch(() => undefined);
      throw error;
    }
    return NextResponse.json({ success: true, status: "PAYMENT_REVIEW" });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Data pembayaran belum valid.", fields: error.flatten().fieldErrors }, { status: 422 });
    console.error("submit-payment", error);
    return NextResponse.json({ error: "Bukti pembayaran belum dapat disimpan." }, { status: 500 });
  }
}
