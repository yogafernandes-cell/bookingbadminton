"use client";
/* eslint-disable @next/next/no-img-element */

import { CheckCircle2, CirclePause, ImageIcon, LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Court = { id: string; name: string; description: string | null; floorType: string; hourlyRate: number; imageUrl: string | null; isActive: boolean };
type Draft = Omit<Court, "id">;
const emptyDraft: Draft = { name: "", description: "", floorType: "Karpet Vinyl", hourlyRate: 60000, imageUrl: "", isActive: true };
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const inputClass = "h-11 rounded-lg border border-border bg-background px-3 text-sm font-normal outline-none transition placeholder:text-muted/50 focus:border-primary";

export function CourtManager({ courts }: { courts: Court[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Court | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const openAdd = () => { setAdding(true); setEditing(null); setError(""); setSuccess(""); };
  const openEdit = (court: Court) => { setEditing(court); setAdding(false); setError(""); setSuccess(""); };
  const close = () => { setAdding(false); setEditing(null); setError(""); };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    const form = new FormData(event.currentTarget);
    let imageUrl = String(form.get("imageUrl") ?? "");
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      const upload = new FormData();
      upload.append("file", photo);
      const response = await fetch("/api/admin/courts/upload", { method: "POST", body: upload });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Foto belum dapat diupload."); setSaving(false); return; }
      imageUrl = result.imageUrl;
    }
    const payload = {
      name: form.get("name"), description: form.get("description"), floorType: form.get("floorType"),
      hourlyRate: Number(form.get("hourlyRate")), imageUrl, isActive: form.get("isActive") === "on",
    };
    const response = await fetch(editing ? `/api/admin/courts/${editing.id}` : "/api/admin/courts", {
      method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Lapangan belum dapat disimpan."); setSaving(false); return; }
    const isEditing = Boolean(editing);
    setSaving(false); close(); setSuccess(isEditing ? "Lapangan berhasil diperbarui." : "Lapangan berhasil ditambahkan."); router.refresh();
  }

  const draft = editing ?? emptyDraft;
  return <div className="mt-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted"><strong className="text-foreground">{courts.length}</strong> lapangan terdaftar</p><button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"><Plus className="size-4" />Tambah lapangan</button></div>
    {success ? <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm font-bold text-primary"><CheckCircle2 className="size-5" />{success}</p> : null}
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {courts.map((court) => <article key={court.id} className="overflow-hidden rounded-xl border border-border bg-surface"><div className="grid sm:grid-cols-[150px_1fr]"><div className="relative min-h-32 bg-surface-high">{court.imageUrl ? <img src={court.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <ImageIcon className="absolute inset-0 m-auto size-9 text-muted" />}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-extrabold">{court.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${court.isActive ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"}`}>{court.isActive ? "Aktif" : "Nonaktif"}</span></div><p className="mt-2 text-sm text-muted">{court.floorType}</p></div><button onClick={() => openEdit(court)} aria-label={`Edit ${court.name}`} className="rounded-lg border border-border p-2.5 text-muted hover:border-primary hover:text-primary"><Pencil className="size-4" /></button></div><p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted">{court.description || "Belum ada deskripsi."}</p><p className="mt-4 font-extrabold text-primary">{rupiah.format(court.hourlyRate)} <span className="text-xs font-bold text-muted">/ jam</span></p></div></div></article>)}
    </div>
    {courts.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">Belum ada lapangan. Tambahkan lapangan pertama.</div> : null}
    {adding || editing ? <div className="fixed inset-0 z-50 grid overflow-y-auto bg-background/80 p-4 backdrop-blur-sm sm:place-items-center"><form onSubmit={submit} className="my-auto w-full max-w-2xl rounded-xl border border-border bg-surface p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Lapangan</p><h2 className="mt-1 text-2xl font-extrabold">{editing ? "Edit lapangan" : "Tambah lapangan"}</h2></div><button type="button" onClick={close} className="rounded-lg border border-border p-2 text-muted hover:text-foreground"><X className="size-5" /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Nama lapangan<input className={inputClass} name="name" required minLength={3} maxLength={60} defaultValue={draft.name} placeholder="Contoh: Lapangan 3" /></label><label className="grid gap-2 text-sm font-bold">Harga dasar per jam<input className={inputClass} name="hourlyRate" required type="number" min="10000" max="1000000" step="1000" defaultValue={draft.hourlyRate} inputMode="numeric" /></label><label className="grid gap-2 text-sm font-bold">Jenis lantai<input className={inputClass} name="floorType" required minLength={2} maxLength={80} defaultValue={draft.floorType} placeholder="Contoh: Karpet Vinyl" /></label><label className="grid gap-2 text-sm font-bold">Foto lapangan <span className="font-normal text-muted">(JPG, PNG, WebP maks. 5 MB)</span><input className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-bold file:text-[#091422]" name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label><input name="imageUrl" type="hidden" value={draft.imageUrl ?? ""} readOnly /><label className="grid gap-2 text-sm font-bold sm:col-span-2">Deskripsi <span className="font-normal text-muted">(opsional)</span><textarea className="rounded-lg border border-border bg-background p-3 font-normal outline-none focus:border-primary" name="description" rows={3} maxLength={300} defaultValue={draft.description ?? ""} placeholder="Keunggulan lapangan ini..." /></label><label className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-bold sm:col-span-2"><input name="isActive" type="checkbox" className="size-4 accent-primary" defaultChecked={draft.isActive} /><span>{draft.isActive ? "Lapangan aktif dan bisa dibooking" : "Lapangan nonaktif"}</span><CirclePause className="ml-auto size-4 text-muted" /></label></div>{error ? <p role="alert" className="mt-5 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-red-300">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={close} className="rounded-lg border border-border px-5 py-3 font-bold">Batal</button><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-extrabold text-primary-foreground disabled:opacity-70">{saving ? <LoaderCircle className="size-5 animate-spin" /> : <Save className="size-5" />}{saving ? "Mengunggah & menyimpan..." : "Simpan lapangan"}</button></div></form></div> : null}
  </div>;
}
