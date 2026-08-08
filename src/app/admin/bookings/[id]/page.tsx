import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const booking = await db.booking.findUnique({ where: { id }, include: { items: { include: { court: true }, orderBy: { startsAt: "asc" } }, payments: { orderBy: { createdAt: "desc" } } } });
  if (!booking) notFound();
  const first = booking.items[0]; const last = booking.items.at(-1);
  const schedule = first && last ? `${first.court.name}, ${format(first.startsAt, "EEEE, d MMMM yyyy", { locale: localeId })} pukul ${format(first.startsAt, "HH:mm")}–${format(last.endsAt, "HH:mm")} WIB` : "-";
  const statusText = booking.status === "CONFIRMED" ? "sudah dikonfirmasi" : booking.status === "PAYMENT_REVIEW" ? "sedang menunggu verifikasi" : "telah kami terima";
  const message = `Halo ${booking.customerName}, booking ${booking.code} Anda ${statusText}.%0A%0AJadwal: ${schedule}%0ATotal: ${rupiah.format(Number(booking.totalAmount))}%0A%0ATerima kasih.`;
  const whatsappUrl = `https://wa.me/${booking.customerPhone}?text=${message}`;
  return <div><Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="size-4" />Kembali ke daftar</Link><div className="mt-5 flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-muted">Detail booking</p><h1 className="mt-1 font-mono text-3xl font-extrabold text-primary">{booking.code}</h1></div><BookingStatusBadge status={booking.status} /></div><div className="mt-7 grid gap-6 lg:grid-cols-[1fr_330px]"><div className="grid gap-5"><section className="rounded-xl border border-border bg-surface p-5"><h2 className="text-xl font-bold">Pelanggan</h2><p className="mt-4 font-bold">{booking.customerName}</p><p className="mt-1 text-muted">+{booking.customerPhone}</p><p className="mt-3 text-sm text-muted">{booking.notes || "Tidak ada catatan."}</p></section><section className="rounded-xl border border-border bg-surface p-5"><h2 className="text-xl font-bold">Jadwal</h2><p className="mt-4 font-bold">{schedule}</p><p className="mt-3 text-sm text-muted">{booking.items.length} jam · {booking.payments.length} bukti pembayaran</p></section></div><aside className="h-fit rounded-xl border border-border bg-surface p-5"><p className="text-xs font-bold uppercase tracking-widest text-muted">Ringkasan</p><p className="mt-3 text-2xl font-extrabold text-primary">{rupiah.format(Number(booking.totalAmount))}</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-extrabold text-background"><MessageCircle className="size-5" />Kirim Konfirmasi WhatsApp</a>{booking.status === "PAYMENT_REVIEW" ? <Link href="/admin/payments" className="mt-3 flex w-full justify-center rounded-lg border border-primary px-4 py-3 font-bold text-primary">Verifikasi pembayaran</Link> : null}</aside></div></div>;
}
