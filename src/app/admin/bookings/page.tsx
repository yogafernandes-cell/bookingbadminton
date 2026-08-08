import { addDays, format } from "date-fns";
import { id } from "date-fns/locale";
import type { BookingStatus, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronRight, Search, X } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const validStatuses = new Set<BookingStatus>(["PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED", "REJECTED", "EXPIRED", "CANCELLED", "COMPLETED"]);
const maskPhone = (phone: string) => phone.length > 7 ? `${phone.slice(0, 4)}••••${phone.slice(-4)}` : phone;

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; date?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const status = validStatuses.has(query.status as BookingStatus) ? query.status as BookingStatus : undefined;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(query.date ?? "") ? query.date : undefined;
  const where: Prisma.BookingWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ code: { contains: q, mode: "insensitive" } }, { customerName: { contains: q, mode: "insensitive" } }, { customerPhone: { contains: q.replace(/\D/g, "") } }] } : {}),
    ...(validDate ? { items: { some: { startsAt: { gte: new Date(`${validDate}T00:00:00+07:00`), lt: addDays(new Date(`${validDate}T00:00:00+07:00`), 1) } } } } : {}),
  };
  const bookings = await db.booking.findMany({ where, include: { items: { include: { court: { select: { name: true } } }, orderBy: { startsAt: "asc" } }, _count: { select: { payments: true } } }, orderBy: { createdAt: "desc" }, take: 100 });

  return <div><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operasional</p><h1 className="mt-2 text-3xl font-extrabold">Daftar booking</h1><p className="mt-2 text-muted">Cari dan periksa maksimal 100 transaksi terbaru yang sesuai filter.</p></div><form action="/admin/bookings" className="mt-7 grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(220px,1fr)_210px_180px_auto]"><label className="relative"><Search className="absolute left-3 top-3.5 size-5 text-muted" /><input name="q" defaultValue={q} placeholder="Kode, nama, atau WhatsApp" className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-4 outline-none focus:border-primary" /></label><select name="status" defaultValue={status ?? ""} className="h-12 rounded-lg border border-border bg-background px-4 outline-none focus:border-primary"><option value="">Semua status</option><option value="PENDING_PAYMENT">Menunggu pembayaran</option><option value="PAYMENT_REVIEW">Menunggu verifikasi</option><option value="CONFIRMED">Terkonfirmasi</option><option value="REJECTED">Ditolak</option><option value="EXPIRED">Kedaluwarsa</option><option value="CANCELLED">Dibatalkan</option><option value="COMPLETED">Selesai</option></select><label className="relative"><CalendarDays className="absolute left-3 top-3.5 size-5 text-muted" /><input name="date" type="date" defaultValue={validDate ?? ""} className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-3 outline-none focus:border-primary" /></label><button className="h-12 rounded-lg bg-primary px-5 font-extrabold text-primary-foreground">Terapkan</button>{q || status || validDate ? <Link href="/admin/bookings" className="flex items-center justify-center gap-2 text-sm font-bold text-muted md:col-span-4 md:justify-self-end"><X className="size-4" />Hapus filter</Link> : null}</form><div className="mt-5 flex items-center justify-between"><p className="text-sm text-muted"><strong className="text-foreground">{bookings.length}</strong> booking ditemukan</p></div><div className="mt-4 grid gap-3">{bookings.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">Tidak ada booking yang sesuai filter.</div> : bookings.map((booking) => { const first = booking.items[0]; const last = booking.items.at(-1); return <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="group rounded-xl border border-border bg-surface p-4 transition hover:border-primary sm:p-5"><div className="grid items-center gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto]"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-mono text-lg font-extrabold text-primary">{booking.code}</h2><BookingStatusBadge status={booking.status} /></div><p className="mt-2 font-bold">{booking.customerName}</p><p className="mt-1 text-sm text-muted">{maskPhone(booking.customerPhone)}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-muted">Jadwal</p>{first && last ? <><p className="mt-1 font-bold">{first.court.name}</p><p className="mt-1 text-sm capitalize text-muted">{format(first.startsAt, "d MMM yyyy", { locale: id })} · {format(first.startsAt, "HH:mm")}–{format(last.endsAt, "HH:mm")}</p></> : <p className="mt-1 text-muted">-</p>}</div><div><p className="text-xs font-bold uppercase tracking-wider text-muted">Total</p><p className="mt-1 text-xl font-extrabold">{rupiah.format(Number(booking.totalAmount))}</p><p className="mt-1 text-xs text-muted">{booking._count.payments} bukti pembayaran</p></div><ChevronRight className="hidden size-6 text-muted transition group-hover:translate-x-1 group-hover:text-primary md:block" /></div></Link>; })}</div></div>;
}
