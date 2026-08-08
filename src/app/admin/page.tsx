import { addDays, format, startOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Banknote, CalendarDays, ChevronRight, CircleAlert, CircleCheckBig, CreditCard, LayoutDashboard, MapPinned } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const now = new Date();
  const today = new Date(`${format(now, "yyyy-MM-dd")}T00:00:00+07:00`);
  const tomorrow = addDays(today, 1);
  const monthStart = startOfMonth(now);
  const [todaySlots, pendingPayments, monthlyRevenue, activeCourts, blockedToday, recentBookings] = await Promise.all([
    db.bookingItem.count({ where: { startsAt: { gte: today, lt: tomorrow } } }),
    db.payment.count({ where: { status: "SUBMITTED", booking: { status: "PAYMENT_REVIEW" } } }),
    db.payment.aggregate({ where: { status: "VERIFIED", reviewedAt: { gte: monthStart } }, _sum: { amount: true } }),
    db.court.count({ where: { isActive: true } }),
    db.courtSlot.count({ where: { status: "BLOCKED", startsAt: { gte: today, lt: tomorrow } } }),
    db.booking.findMany({ include: { items: { include: { court: { select: { name: true } } }, orderBy: { startsAt: "asc" }, take: 1 } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const cards = [
    { label: "Sesi hari ini", value: String(todaySlots), note: "Jadwal bermain terdaftar", icon: CalendarDays, href: "/admin/bookings?date=" + format(today, "yyyy-MM-dd"), tone: "text-primary" },
    { label: "Menunggu verifikasi", value: String(pendingPayments), note: "Bukti transfer perlu dicek", icon: CreditCard, href: "/admin/payments", tone: "text-warning" },
    { label: "Omzet bulan ini", value: rupiah.format(Number(monthlyRevenue._sum.amount ?? 0)), note: "Pembayaran sudah terverifikasi", icon: Banknote, href: "/admin/bookings?status=CONFIRMED", tone: "text-primary" },
    { label: "Lapangan operasional", value: `${activeCourts} aktif`, note: `${blockedToday} slot diblokir hari ini`, icon: MapPinned, href: "/admin/schedules", tone: "text-primary" },
  ];

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary"><LayoutDashboard className="size-4" />Ringkasan arena</p><h1 className="mt-2 text-3xl font-extrabold">Dashboard admin</h1><p className="mt-2 text-muted">Pantau kondisi operasional arena hari ini, {format(now, "EEEE, d MMMM yyyy", { locale: id })}.</p></div><Link href="/admin/bookings" className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-extrabold text-primary">Lihat semua booking <ChevronRight className="size-4" /></Link></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <Link key={card.label} href={card.href} className="group rounded-xl border border-border bg-surface p-5 transition hover:border-primary"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-muted">{card.label}</p><Icon className={`size-5 ${card.tone}`} /></div><p className="mt-4 text-2xl font-extrabold">{card.value}</p><p className="mt-2 text-xs text-muted">{card.note}</p></Link>; })}</section>
    <section className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="rounded-xl border border-border bg-surface"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-xl font-extrabold">Booking terbaru</h2><p className="mt-1 text-sm text-muted">Enam transaksi terakhir yang masuk.</p></div><Link href="/admin/bookings" className="text-sm font-bold text-primary">Semua</Link></div><div className="divide-y divide-border">{recentBookings.length === 0 ? <p className="p-8 text-center text-sm text-muted">Belum ada booking masuk.</p> : recentBookings.map((booking) => { const item = booking.items[0]; return <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-surface-high/40"><div><div className="flex flex-wrap items-center gap-2"><p className="font-mono font-extrabold text-primary">{booking.code}</p><BookingStatusBadge status={booking.status} /></div><p className="mt-2 font-bold">{booking.customerName}</p><p className="mt-1 text-sm text-muted">{item ? `${item.court.name} · ${format(item.startsAt, "d MMM, HH:mm", { locale: id })}` : "Jadwal belum tersedia"}</p></div><div className="text-right"><p className="font-extrabold">{rupiah.format(Number(booking.totalAmount))}</p><p className="mt-1 text-xs text-muted">{format(booking.createdAt, "d MMM, HH:mm", { locale: id })}</p></div></Link>; })}</div></div>
      <aside className="h-fit rounded-xl border border-border bg-surface p-5"><div className="flex items-center gap-3"><CircleAlert className="size-6 text-warning" /><div><h2 className="font-extrabold">Tindakan cepat</h2><p className="text-sm text-muted">Prioritas operasional hari ini.</p></div></div><div className="mt-5 grid gap-3"><Link href="/admin/payments" className="rounded-lg border border-warning/40 bg-warning/10 p-4 transition hover:border-warning"><p className="font-extrabold text-warning">{pendingPayments} pembayaran perlu diperiksa</p><p className="mt-1 text-sm text-muted">Verifikasi bukti transfer pelanggan.</p></Link><Link href="/admin/schedules" className="rounded-lg border border-border bg-background p-4 transition hover:border-primary"><p className="flex items-center gap-2 font-extrabold"><CircleCheckBig className="size-4 text-primary" />Atur jadwal lapangan</p><p className="mt-1 text-sm text-muted">Kelola blokir maintenance atau turnamen.</p></Link></div></aside></section>
  </div>;
}
