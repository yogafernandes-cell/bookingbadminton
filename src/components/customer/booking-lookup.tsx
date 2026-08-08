"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, LoaderCircle, Search, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";

type BookingResult = { code: string; customerName: string; status: string; paymentStatus: string; totalAmount: number; paymentDueAt: string; createdAt: string; notes: string | null; items: { courtName: string; floorType: string; startsAt: string; endsAt: string; price: number }[]; latestPayment: { status: string; rejectionReason: string | null; createdAt: string } | null };
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const statuses: Record<string, { label: string; description: string; tone: string }> = {
  PENDING_PAYMENT: { label: "Menunggu pembayaran", description: "Selesaikan transfer dan upload bukti sebelum batas waktu.", tone: "text-warning bg-warning/10 border-warning/40" },
  PAYMENT_REVIEW: { label: "Menunggu verifikasi", description: "Bukti pembayaran sudah diterima dan sedang diperiksa admin.", tone: "text-warning bg-warning/10 border-warning/40" },
  CONFIRMED: { label: "Terkonfirmasi", description: "Pembayaran diterima dan jadwal sudah dikonfirmasi.", tone: "text-primary bg-primary/10 border-primary/40" },
  REJECTED: { label: "Bukti ditolak", description: "Periksa alasan penolakan lalu upload bukti yang benar.", tone: "text-red-300 bg-danger/10 border-danger/40" },
  EXPIRED: { label: "Kedaluwarsa", description: "Batas pembayaran telah habis dan slot sudah dilepas.", tone: "text-red-300 bg-danger/10 border-danger/40" },
  CANCELLED: { label: "Dibatalkan", description: "Booking ini telah dibatalkan.", tone: "text-red-300 bg-danger/10 border-danger/40" },
  COMPLETED: { label: "Selesai", description: "Jadwal bermain telah selesai.", tone: "text-muted bg-surface-high border-border" },
};

export function BookingLookup() {
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setBooking(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/bookings/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: data.get("code"), customerPhone: data.get("customerPhone") }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Booking tidak ditemukan."); setLoading(false); return; }
    setBooking(result.booking); setLoading(false);
  }
  const status = booking ? (statuses[booking.status] ?? statuses.COMPLETED) : null;
  const first = booking?.items[0]; const last = booking?.items.at(-1);
  return <div className="mt-8 grid gap-6"><form onSubmit={submit} className="rounded-xl border border-border bg-surface p-5 sm:p-7"><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Kode booking<input name="code" required autoCapitalize="characters" placeholder="BKM-260808-XXXXXXXX" className="h-12 rounded-lg border border-border bg-background px-4 font-mono uppercase outline-none placeholder:font-sans placeholder:text-muted/50 focus:border-primary" /></label><label className="grid gap-2 text-sm font-bold">Nomor WhatsApp<input name="customerPhone" required inputMode="tel" placeholder="Nomor saat booking" className="h-12 rounded-lg border border-border bg-background px-4 outline-none placeholder:text-muted/50 focus:border-primary" /></label></div>{error ? <p role="alert" className="mt-4 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-red-300"><XCircle className="size-5 shrink-0" />{error}</p> : null}<button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-extrabold text-primary-foreground disabled:opacity-70">{loading ? <LoaderCircle className="size-5 animate-spin" /> : <Search className="size-5" />}{loading ? "Mencari..." : "Cek status booking"}</button></form>{booking && status ? <section className="overflow-hidden rounded-xl border border-border bg-surface"><div className={`border-b p-5 sm:p-6 ${status.tone}`}><div className="flex items-start gap-3">{booking.status === "CONFIRMED" ? <CheckCircle2 className="size-7 shrink-0" /> : booking.status === "REJECTED" || booking.status === "EXPIRED" || booking.status === "CANCELLED" ? <AlertTriangle className="size-7 shrink-0" /> : <Clock3 className="size-7 shrink-0" />}<div><p className="text-xl font-extrabold">{status.label}</p><p className="mt-1 text-sm opacity-90">{status.description}</p></div></div></div><div className="p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-muted">Kode booking</p><h2 className="mt-1 font-mono text-2xl font-extrabold text-primary">{booking.code}</h2><p className="mt-1 text-sm text-muted">a.n. {booking.customerName}</p></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-widest text-muted">Total</p><p className="mt-1 text-2xl font-extrabold">{rupiah.format(booking.totalAmount)}</p></div></div>{first && last ? <div className="mt-6 grid gap-3 rounded-lg border border-border bg-background/40 p-4 text-sm"><p className="font-bold">{first.courtName} · <span className="font-normal text-muted">{first.floorType}</span></p><p className="flex items-center gap-3 capitalize"><CalendarDays className="size-5 text-primary" />{format(new Date(first.startsAt), "EEEE, d MMMM yyyy", { locale: id })}</p><p className="flex items-center gap-3"><Clock3 className="size-5 text-primary" />{format(new Date(first.startsAt), "HH:mm")}–{format(new Date(last.endsAt), "HH:mm")} WIB ({booking.items.length} jam)</p></div> : null}{booking.status === "REJECTED" ? <div className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-4"><p className="text-xs font-bold uppercase tracking-widest text-red-300">Alasan penolakan</p><p className="mt-2 text-sm">{booking.latestPayment?.rejectionReason ?? "Hubungi admin untuk informasi lebih lanjut."}</p></div> : null}{booking.status === "PENDING_PAYMENT" || booking.status === "REJECTED" ? <Link href={`/booking/${booking.code}`} className="mt-5 flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3.5 font-extrabold text-primary-foreground">{booking.status === "REJECTED" ? "Upload ulang bukti" : "Lanjutkan pembayaran"}</Link> : null}</div></section> : null}</div>;
}
