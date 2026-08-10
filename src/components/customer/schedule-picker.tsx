"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";

type SlotStatus = "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
type ScheduleCourt = { id: string; name: string; floorType: string; hourlyRate: number; imageUrl: string; slots: { id: string; time: string; price: number; status: SlotStatus; renterName?: string }[] };
export type ScheduleDay = { key: string; dayName: string; dayNumber: string; fullLabel: string; courts: ScheduleCourt[] };

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function SchedulePicker({ days, initialCourtId, initialDate }: { days: ScheduleDay[]; initialCourtId?: string; initialDate?: string }) {
  const [activeDayKey, setActiveDayKey] = useState(days.some((day) => day.key === initialDate) ? initialDate! : (days[0]?.key ?? ""));
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourtId && days[0]?.courts.some((court) => court.id === initialCourtId) ? initialCourtId : "");
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const activeDay = days.find((day) => day.key === activeDayKey) ?? days[0];
  const selectedCourt = activeDay?.courts.find((court) => court.id === selectedCourtId);
  const total = selectedCourt?.slots.filter((slot) => selectedSlotIds.includes(slot.id)).reduce((sum, slot) => sum + slot.price, 0) ?? 0;

  const selectedTimes = useMemo(() => selectedCourt?.slots.filter((slot) => selectedSlotIds.includes(slot.id)).map((slot) => slot.time) ?? [], [selectedCourt, selectedSlotIds]);

  function changeDay(key: string) { setActiveDayKey(key); setSelectedCourtId(""); setSelectedSlotIds([]); }
  function toggleSlot(courtId: string, slotId: string) {
    if (selectedCourtId && selectedCourtId !== courtId) { setSelectedCourtId(courtId); setSelectedSlotIds([slotId]); return; }
    setSelectedCourtId(courtId);
    setSelectedSlotIds((current) => current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId]);
  }

  if (!activeDay) return <div className="mx-auto max-w-7xl px-4 py-10 text-muted">Jadwal belum tersedia.</div>;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="size-4" />Kembali ke beranda</Link>
      <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Booking lapangan</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Pilih tanggal & jadwal</h1><p className="mt-2 text-muted">Pilih satu atau beberapa sesi pada lapangan yang sama.</p></div>

      <section aria-label="Pilih tanggal" className="no-scrollbar mt-7 flex gap-2.5 overflow-x-auto pb-2">
        {days.map((day) => <button key={day.key} type="button" onClick={() => changeDay(day.key)} aria-pressed={day.key === activeDay.key} className={`min-w-[82px] rounded-lg border px-4 py-3 transition ${day.key === activeDay.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary"}`}><span className="block text-xs font-bold tracking-wider">{day.dayName}</span><span className="mt-1 block text-2xl font-extrabold leading-none">{day.dayNumber}</span></button>)}
      </section>
      <p className="mt-3 text-sm font-semibold capitalize text-muted">{activeDay.fullLabel}</p>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-5">
          {activeDay.courts.map((court) => (
            <article key={court.id} className={`overflow-hidden rounded-xl border bg-surface transition ${selectedCourtId === court.id ? "border-primary" : "border-border"}`}>
              <div className="grid sm:grid-cols-[190px_1fr]">
                <div className="relative min-h-40 bg-surface-high"><Image src={court.imageUrl} alt={court.name} fill sizes="190px" className="object-cover" /><span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground">Tersedia</span></div>
                <div className="p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-bold">{court.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-muted"><Layers3 className="size-4 text-primary" />{court.floorType}</p></div><div className="text-right"><p className="text-xs font-semibold text-muted">HARGA / JAM</p><p className="mt-1 text-lg font-extrabold text-primary">{rupiah.format(court.hourlyRate)}</p></div></div></div>
              </div>
              <div className="border-t border-border p-5"><div className="mb-3 flex flex-wrap gap-4 text-xs font-semibold text-muted"><span><i className="mr-1 inline-block size-2 rounded-full bg-primary" />Tersedia</span><span><i className="mr-1 inline-block size-2 rounded-full bg-surface-high" />Dibooking</span><span><i className="mr-1 inline-block size-2 rounded-full bg-warning" />Diblokir</span></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-6">{court.slots.map((slot) => { const selected = selectedSlotIds.includes(slot.id); const disabled = slot.status !== "AVAILABLE"; return <button key={slot.id} type="button" disabled={disabled} onClick={() => toggleSlot(court.id, slot.id)} className={`relative min-h-12 rounded-md border px-2 py-2 text-sm font-bold transition ${selected ? "border-primary bg-primary text-primary-foreground" : slot.status === "BLOCKED" ? "border-warning/60 bg-warning/10 text-warning" : slot.status === "BOOKED" ? "cursor-not-allowed border-border bg-background/40 text-muted/70" : disabled ? "cursor-not-allowed border-border bg-background/40 text-muted/40" : "border-border bg-background hover:border-primary"}`}>{selected ? <Check className="absolute right-1 top-1 size-3" /> : null}<span className={slot.status === "BOOKED" ? "line-through" : undefined}>{slot.time}</span>{slot.renterName ? <span title={slot.renterName} className="mt-1 block truncate text-[10px] font-semibold normal-case leading-tight text-primary">{slot.renterName}</span> : slot.price !== court.hourlyRate ? <span className="mt-1 block text-[10px] font-semibold opacity-80">{rupiah.format(slot.price)}</span> : null}</button>; })}</div></div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-xl border border-border bg-surface p-5 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Ringkasan booking</p><h2 className="mt-2 text-xl font-bold">{selectedCourt?.name ?? "Belum memilih"}</h2><p className="mt-1 text-sm capitalize text-muted">{activeDay.fullLabel}</p>
          <div className="my-5 border-y border-border py-4"><div className="flex justify-between text-sm"><span className="text-muted">Sesi dipilih</span><span className="font-bold">{selectedSlotIds.length} jam</span></div><p className="mt-2 min-h-5 text-sm font-semibold text-primary">{selectedTimes.join(", ") || "Pilih waktu bermain"}</p></div>
          <div className="flex items-end justify-between"><span className="text-sm text-muted">Total pembayaran</span><strong className="text-2xl text-primary">{rupiah.format(total)}</strong></div>
          {selectedSlotIds.length > 0 ? <Link href={`/booking?date=${activeDay.key}&court=${selectedCourtId}&slots=${encodeURIComponent(selectedTimes.join(","))}`} style={{ color: "#091422" }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-extrabold">Lanjutkan <ArrowRight className="size-5" /></Link> : <button type="button" disabled className="mt-5 w-full rounded-lg bg-surface-high px-5 py-3.5 font-bold text-muted/50">Pilih jadwal dulu</button>}
        </aside>
      </div>
    </div>
  );
}
