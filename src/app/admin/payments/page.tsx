import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PaymentReviewActions } from "@/components/admin/payment-review-actions";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPaymentProofSignedUrl } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const payments = await db.payment.findMany({ where: { status: "SUBMITTED", booking: { status: "PAYMENT_REVIEW" } }, include: { booking: { include: { items: { include: { court: true }, orderBy: { startsAt: "asc" } } } } }, orderBy: { createdAt: "asc" } });
  const rows = await Promise.all(payments.map(async (payment) => ({ payment, signedUrl: await createPaymentProofSignedUrl(payment.proofPublicId, 600).catch(() => null) })));
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Pembayaran</p><h1 className="mt-2 text-3xl font-extrabold">Menunggu verifikasi</h1><p className="mt-2 text-muted">Periksa nama, nominal, dan bukti sebelum menerima pembayaran.</p></div><span className="rounded-full bg-warning/15 px-4 py-2 text-sm font-bold text-warning">{rows.length} perlu diperiksa</span></div><div className="mt-7 grid gap-6">{rows.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">Tidak ada pembayaran yang menunggu verifikasi.</div> : rows.map(({ payment, signedUrl }) => { const item = payment.booking.items[0]; return <article key={payment.id} className="overflow-hidden rounded-xl border border-border bg-surface"><div className="grid lg:grid-cols-[360px_1fr]"><div className="relative min-h-72 bg-background">{signedUrl ? <Image src={signedUrl} alt={`Bukti pembayaran ${payment.booking.code}`} fill sizes="360px" className="object-contain p-3" unoptimized /> : <div className="grid h-full place-items-center p-8 text-center text-sm text-muted">Preview tidak tersedia. Periksa konfigurasi Storage.</div>}</div><div className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-muted">Kode booking</p><h2 className="mt-1 text-2xl font-extrabold text-primary">{payment.booking.code}</h2></div><span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning">Menunggu verifikasi</span></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-muted">Pemesan</dt><dd className="mt-1 font-bold">{payment.booking.customerName}</dd></div><div><dt className="text-muted">Pengirim transfer</dt><dd className="mt-1 font-bold">{payment.senderName}</dd></div><div><dt className="text-muted">Lapangan & jadwal</dt><dd className="mt-1 font-bold">{item?.court.name ?? "-"}<br/><span className="font-normal text-muted">{item ? format(item.startsAt, "d MMM yyyy, HH:mm", { locale: id }) : "-"}</span></dd></div><div><dt className="text-muted">Nominal</dt><dd className="mt-1 text-xl font-extrabold">{rupiah.format(Number(payment.amount))}</dd></div></dl><PaymentReviewActions paymentId={payment.id} /></div></div></article>; })}</div></div>;
}
