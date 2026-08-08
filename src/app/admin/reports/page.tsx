import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { id } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, WalletCards } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function ReportsPage() {
  const session = await getServerSession(authOptions); if (!session) redirect("/admin/login");
  const now = new Date();
  const periods = [
    { key: "Hari ini", start: startOfDay(now), end: endOfDay(now), label: format(now, "EEEE, d MMMM", { locale: id }) },
    { key: "Minggu ini", start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }), label: "Senin–Minggu" },
    { key: "Bulan ini", start: startOfMonth(now), end: endOfMonth(now), label: format(now, "MMMM yyyy", { locale: id }) },
  ];
  const totals = await Promise.all(periods.map(async (period) => ({ ...period, payment: await db.payment.aggregate({ where: { status: "VERIFIED", reviewedAt: { gte: period.start, lte: period.end } }, _sum: { amount: true }, _count: true }) })));
  const thisMonth = totals[2];
  const recent = await db.payment.findMany({ where: { status: "VERIFIED", reviewedAt: { gte: thisMonth.start, lte: thisMonth.end } }, include: { booking: true }, orderBy: { reviewedAt: "desc" }, take: 12 });
  return <div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-primary"><BarChart3 className="size-4" />Keuangan</p><h1 className="mt-2 text-3xl font-extrabold">Laporan pendapatan</h1><p className="mt-2 text-muted">Hanya menghitung pembayaran yang sudah diverifikasi admin.</p><section className="mt-7 grid gap-4 md:grid-cols-3">{totals.map(({ key, label, payment }) => <article key={key} className="rounded-xl border border-border bg-surface p-5"><div className="flex items-start justify-between"><div><p className="font-bold text-muted">{key}</p><p className="mt-1 text-xs capitalize text-muted">{label}</p></div><WalletCards className="size-5 text-primary" /></div><p className="mt-5 text-2xl font-extrabold text-primary">{rupiah.format(Number(payment._sum.amount ?? 0))}</p><p className="mt-2 text-sm text-muted">{payment._count} pembayaran tervalidasi</p></article>)}</section><section className="mt-7 rounded-xl border border-border bg-surface"><div className="flex items-center gap-3 border-b border-border p-5"><CalendarDays className="size-5 text-primary" /><div><h2 className="font-extrabold">Transaksi bulan ini</h2><p className="text-sm text-muted">12 pembayaran terakhir yang sudah diverifikasi.</p></div></div><div className="divide-y divide-border">{recent.length === 0 ? <p className="p-8 text-center text-sm text-muted">Belum ada pembayaran terverifikasi bulan ini.</p> : recent.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-mono font-extrabold text-primary">{payment.booking.code}</p><p className="mt-1 text-sm font-bold">{payment.booking.customerName}</p><p className="mt-1 text-xs text-muted">{payment.reviewedAt ? format(payment.reviewedAt, "d MMM yyyy, HH:mm", { locale: id }) : "-"}</p></div><p className="font-extrabold">{rupiah.format(Number(payment.amount))}</p></div>)}</div></section></div>;
}
