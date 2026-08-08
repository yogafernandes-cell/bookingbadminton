"use client";

import { CalendarClock, LoaderCircle, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const times = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`);

export function BookingManagementActions({ bookingId, initialDate, initialTimes, disabled }: { bookingId: string; initialDate: string; initialTimes: string[]; disabled: boolean }) {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [open, setOpen] = useState(false);
  async function request(payload: unknown) { setBusy(true); setError(""); const response = await fetch(`/api/admin/bookings/${bookingId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) { setError(result.error ?? "Booking belum dapat diperbarui."); setBusy(false); return; } router.refresh(); setBusy(false); setOpen(false); }
  async function reschedule(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); await request({ action: "reschedule", date: form.get("date"), times: form.getAll("times") }); }
  if (disabled) return null;
  return <div className="mt-3 grid gap-3"><button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-3 font-bold text-primary"><CalendarClock className="size-4" />Jadwalkan ulang</button>{open ? <form onSubmit={reschedule} className="grid gap-3 rounded-lg border border-border bg-background p-3 text-left"><label className="grid gap-1 text-xs font-bold">Tanggal baru<input required name="date" type="date" defaultValue={initialDate} className="h-10 rounded-md border border-border bg-surface px-2 text-sm" /></label><label className="grid gap-1 text-xs font-bold">Pilih jam baru <span className="font-normal text-muted">(bisa beberapa)</span><select required name="times" multiple defaultValue={initialTimes} className="h-28 rounded-md border border-border bg-surface px-2 py-1 text-sm">{times.map((time) => <option key={time} value={time}>{time}</option>)}</select></label><button disabled={busy} className="rounded-md bg-primary px-3 py-2.5 text-sm font-extrabold text-[#091422]">{busy ? "Menyimpan..." : "Simpan jadwal baru"}</button></form> : null}<button type="button" disabled={busy} onClick={() => { if (window.confirm("Batalkan booking ini? Slot akan kembali tersedia.")) void request({ action: "cancel" }); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-danger/50 px-4 py-3 font-bold text-red-300"><XCircle className="size-4" />{busy ? <LoaderCircle className="size-4 animate-spin" /> : "Batalkan booking"}</button>{error ? <p className="text-xs font-semibold text-red-300">{error}</p> : null}</div>;
}
