"use client";

import { CheckCircle2, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function PaymentProofForm({ code, amount }: { code: string; amount: number }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("amount", String(amount));
    const response = await fetch(`/api/bookings/${code}/payment`, { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Upload gagal."); setSubmitting(false); return; }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-background/30 p-5">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary/15 text-primary"><Upload className="size-5" /></span><div><h2 className="font-bold">Upload bukti pembayaran</h2><p className="text-xs text-muted">JPG, PNG, atau WebP · maksimal 5 MB</p></div></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Nama pengirim<input name="senderName" required minLength={3} maxLength={100} placeholder="Nama pada rekening" className="h-12 rounded-lg border border-border bg-background px-4 font-normal outline-none focus:border-primary" /></label><label className="grid gap-2 text-sm font-bold">Nomor WhatsApp<input name="customerPhone" required inputMode="tel" placeholder="Nomor saat booking" className="h-12 rounded-lg border border-border bg-background px-4 font-normal outline-none focus:border-primary" /></label></div>
      <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-4 text-center transition hover:border-primary"><ImagePlus className="size-7 text-primary" /><span className="mt-2 text-sm font-bold">{fileName || "Pilih gambar bukti transfer"}</span><input name="proof" type="file" required accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /></label>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-high p-3 text-sm"><CheckCircle2 className="size-5 shrink-0 text-primary" /><span>Nominal yang dikonfirmasi: <strong>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)}</strong></span></div>
      {error ? <p role="alert" className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-red-300">{error}</p> : null}
      <button disabled={submitting} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-extrabold text-primary-foreground disabled:opacity-70">{submitting ? <><LoaderCircle className="size-5 animate-spin" />Mengunggah...</> : <><Upload className="size-5" />Kirim bukti pembayaran</>}</button>
    </form>
  );
}
