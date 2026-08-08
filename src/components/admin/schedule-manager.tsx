"use client";

import { CalendarDays, CheckCircle2, LoaderCircle, LockKeyhole, Unlock, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = { time: string; status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED"; reason: string | null };
type Court = { id: string; name: string; slots: Slot[] };
const labels = { AVAILABLE: "Tersedia", HELD: "Ditahan", BOOKED: "Terbooking", BLOCKED: "Diblokir" };

export function ScheduleManager({ date, courts, opensAt, closesAt }: { date: string; courts: Court[]; opensAt: string; closesAt: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<{ courtId: string; times: string[]; mode: "block" | "unblock" } | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function choose(courtId: string, slot: Slot) {
    if (slot.status === "HELD" || slot.status === "BOOKED") return;
    const mode = slot.status === "BLOCKED" ? "unblock" : "block";
    setError("");
    setReason("");
    setSelected((current) => {
      if (!current || current.courtId !== courtId || current.mode !== mode) return { courtId, times: [slot.time], mode };
      return { ...current, times: current.times.includes(slot.time) ? current.times.filter((time) => time !== slot.time) : [...current.times, slot.time].sort() };
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected?.times.length) return;
    setSaving(true); setError(""); setSuccess("");
    const response = await fetch("/api/admin/schedules", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: selected.mode, courtId: selected.courtId, date, times: selected.times, reason }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Jadwal belum dapat diperbarui."); setSaving(false); return; }
    setSaving(false);
    setSuccess(selected.mode === "block" ? `${result.count} slot berhasil diblokir.` : `${result.count} slot berhasil dibuka kembali.`);
    setSelected(null);
    router.refresh();
  }

  const selectedCourt = courts.find((court) => court.id === selected?.courtId);
  const hasSelectedSlots = (selected?.times.length ?? 0) > 0;

  return <div className="mt-7">
    <form action="/admin/schedules" className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
      <label className="grid gap-2 text-sm font-bold"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />Tanggal jadwal</span><input name="date" type="date" defaultValue={date} min={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })} className="h-11 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary" /></label>
      <button className="h-11 rounded-lg border border-primary px-4 text-sm font-extrabold text-primary">Tampilkan</button>
      <p className="pb-2 text-sm text-muted">Operasional: {opensAt}–{closesAt}</p>
    </form>
    {success ? <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm font-bold text-primary"><CheckCircle2 className="size-5" />{success}</p> : null}
    <div className="mt-5 grid gap-4">
      {courts.map((court) => <section key={court.id} className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-extrabold">{court.name}</h2><p className="mt-1 text-sm text-muted">Klik slot tersedia untuk blokir. Klik slot diblokir untuk membuka kembali.</p></div><div className="flex gap-3 text-xs font-bold text-muted"><span><i className="mr-1 inline-block size-2 rounded-full bg-primary" />Tersedia</span><span><i className="mr-1 inline-block size-2 rounded-full bg-warning" />Diblokir</span></div></div>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">
          {court.slots.map((slot) => {
            const selectedSlot = selected?.courtId === court.id && selected.times.includes(slot.time);
            const unavailable = slot.status === "HELD" || slot.status === "BOOKED";
            return <button key={slot.time} type="button" disabled={unavailable} onClick={() => choose(court.id, slot)} title={slot.reason ?? labels[slot.status]} className={`relative rounded-lg border px-2 py-3 text-sm font-extrabold transition ${selectedSlot ? "border-primary bg-primary text-primary-foreground" : slot.status === "BLOCKED" ? "border-warning/70 bg-warning/10 text-warning" : unavailable ? "cursor-not-allowed border-border bg-background/50 text-muted/40 line-through" : "border-border bg-background hover:border-primary"}`}>{slot.time}</button>;
          })}
        </div>
      </section>)}
    </div>
    {courts.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-border p-10 text-center text-muted">Belum ada lapangan aktif.</div> : null}
    {hasSelectedSlots && selected ? <form onSubmit={submit} className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-xl border border-border bg-surface p-4 shadow-2xl sm:p-5">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-extrabold">{selected.mode === "block" ? "Blokir jadwal" : "Buka blokir jadwal"}</p><p className="mt-1 text-sm text-muted">{selectedCourt?.name} · {selected.times.join(", ")}</p></div><button type="button" onClick={() => setSelected(null)} className="text-muted hover:text-foreground"><X className="size-5" /></button></div>
      {selected.mode === "block" ? <label className="mt-4 grid gap-2 text-sm font-bold">Alasan blokir<textarea required minLength={3} maxLength={160} value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Contoh: Maintenance lampu" className="rounded-lg border border-border bg-background p-3 font-normal outline-none focus:border-primary" /></label> : <p className="mt-4 text-sm text-muted">Slot akan kembali tersedia untuk pelanggan.</p>}
      {error ? <p role="alert" className="mt-3 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-red-300">{error}</p> : null}
      <button disabled={saving} className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-extrabold disabled:opacity-70 ${selected.mode === "block" ? "bg-warning text-background" : "bg-primary text-primary-foreground"}`}>{saving ? <LoaderCircle className="size-5 animate-spin" /> : selected.mode === "block" ? <LockKeyhole className="size-5" /> : <Unlock className="size-5" />}{saving ? "Menyimpan..." : selected.mode === "block" ? "Blokir slot terpilih" : "Buka blokir slot"}</button>
    </form> : null}
  </div>;
}
