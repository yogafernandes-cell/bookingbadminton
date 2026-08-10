"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
type CourtSummary = { id: string; name: string; floorType: string; hourlyRate: number; imageUrl: string };

export function BookingForm({ court, date, times, total }: { court: CourtSummary; date: string; times: string[]; total: number }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formattedDate = format(new Date(`${date}T12:00:00`), "EEEE, d MMMM yyyy", { locale: id });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerName: data.get("customerName"), customerPhone: data.get("customerPhone"), notes: data.get("notes") || undefined, promoCode: data.get("promoCode") || undefined, courtId: court.id, date, times }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Booking gagal diproses."); setIsSubmitting(false); return; }
    router.push(`/booking/${result.code}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <Link href={`/jadwal?court=${court.id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="size-4" />Ubah jadwal</Link>
      <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Langkah 2 dari 3</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Detail pemesanan</h1><p className="mt-2 text-muted">Pastikan jadwal dan data diri Anda sudah benar.</p></div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-5 sm:p-7">
          <h2 className="text-2xl font-bold">Formulir pemesan</h2>
          <div className="mt-6 grid gap-5"><label className="grid gap-2 text-sm font-bold">Nama lengkap<input name="customerName" required minLength={3} maxLength={100} autoComplete="name" placeholder="Masukkan nama lengkap" className="h-12 rounded-lg border border-border bg-background px-4 font-normal text-foreground outline-none transition placeholder:text-muted/50 focus:border-primary" /></label><label className="grid gap-2 text-sm font-bold">Nomor WhatsApp<input name="customerPhone" required inputMode="tel" autoComplete="tel" placeholder="Contoh: 081234567890" className="h-12 rounded-lg border border-border bg-background px-4 font-normal text-foreground outline-none transition placeholder:text-muted/50 focus:border-primary" /></label><label className="grid gap-2 text-sm font-bold">Kode promo <span className="font-normal text-muted">(opsional)</span><input name="promoCode" maxLength={30} placeholder="Contoh: AGUSTUS20" className="h-12 rounded-lg border border-border bg-background px-4 font-normal uppercase text-foreground outline-none transition placeholder:normal-case placeholder:text-muted/50 focus:border-primary" /></label><label className="grid gap-2 text-sm font-bold">Catatan tambahan <span className="font-normal text-muted">(opsional)</span><textarea name="notes" maxLength={500} rows={4} placeholder="Contoh: Butuh sewa raket 2 buah" className="rounded-lg border border-border bg-background p-4 font-normal text-foreground outline-none transition placeholder:text-muted/50 focus:border-primary" /></label></div>
          {error ? <p role="alert" className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-red-300">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-extrabold text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">{isSubmitting ? <><LoaderCircle className="size-5 animate-spin" />Memproses...</> : <>Lanjutkan booking <ArrowRight className="size-5" /></>}</button>
          <p className="mt-3 text-center text-xs leading-5 text-muted">Dengan melanjutkan, jadwal akan ditahan sementara untuk pembayaran.</p>
        </form>
        <aside className="h-fit overflow-hidden rounded-xl border border-border bg-surface lg:sticky lg:top-24"><div className="relative aspect-[16/8]"><Image src={court.imageUrl} alt={court.name} fill sizes="340px" className="object-cover" /></div><div className="p-5"><p className="text-xs font-bold uppercase tracking-widest text-muted">Rincian lapangan</p><h2 className="mt-2 text-2xl font-bold">{court.name}</h2><p className="mt-1 text-sm text-muted">{court.floorType}</p><div className="mt-5 grid gap-3 border-y border-border py-4 text-sm"><p className="flex items-center gap-3"><CalendarDays className="size-4 text-primary" /><span className="capitalize">{formattedDate}</span></p><p className="flex items-center gap-3"><Clock3 className="size-4 text-primary" />{times.join(", ")} · {times.length} jam</p></div><div className="mt-5 flex items-end justify-between"><span className="text-sm text-muted">Total</span><strong className="text-2xl text-primary">{rupiah.format(total)}</strong></div></div></aside>
      </div>
    </div>
  );
}
