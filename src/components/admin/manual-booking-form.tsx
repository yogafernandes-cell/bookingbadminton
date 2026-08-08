"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const input = "h-12 rounded-lg border border-border bg-background px-4 outline-none focus:border-primary";
const times = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

export function ManualBookingForm({ courts }: { courts: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone")).replace(/\D/g, "").replace(/^0/, "62");
    const response = await fetch("/api/admin/manual-bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customerName: form.get("name"), customerPhone: form.get("phone"), courtId: form.get("courtId"), date: form.get("date"), times: form.getAll("times"), paymentStatus: form.get("paymentStatus") }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Booking manual gagal dibuat."); setSaving(false); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Halo ${form.get("name")}, booking ${result.code} berhasil dicatat. Terima kasih.`)}`, "_blank", "noopener,noreferrer");
    router.push(`/admin/bookings/${result.id}`);
  }
  return <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Nama pelanggan<input required name="name" className={input} /></label><label className="grid gap-2 text-sm font-bold">WhatsApp<input required name="phone" type="tel" className={input} /></label><label className="grid gap-2 text-sm font-bold">Lapangan<select required name="courtId" className={input}><option value="">Pilih lapangan</option>{courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Tanggal<input required name="date" type="date" className={input} /></label><label className="grid gap-2 text-sm font-bold">Jam bermain <span className="font-normal text-muted">(boleh pilih beberapa)</span><select required multiple name="times" className="h-44 rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary">{times.map((time) => <option key={time}>{time}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Status pembayaran<select name="paymentStatus" className={input}><option value="PAID">Lunas</option><option value="DP">DP</option><option value="UNPAID">Belum bayar</option></select></label>{error ? <p className="text-sm text-red-300 sm:col-span-2">{error}</p> : null}<button disabled={saving} className="rounded-lg bg-primary px-5 py-3 font-extrabold text-primary-foreground disabled:opacity-70 sm:col-span-2">{saving ? "Menyimpan..." : "Simpan & Chat WhatsApp"}</button></form>;
}
