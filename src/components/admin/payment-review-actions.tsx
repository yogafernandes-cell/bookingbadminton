"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PaymentReviewActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  async function review(action: "approve" | "reject") {
    if (action === "reject" && reason.trim().length < 5) { setError("Tulis alasan penolakan minimal 5 karakter."); return; }
    setError(""); setLoading(action);
    const response = await fetch(`/api/admin/payments/${paymentId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, reason: action === "reject" ? reason : undefined }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Verifikasi gagal."); setLoading(null); return; }
    router.refresh();
  }
  return <div className="mt-6 border-t border-border pt-5"><label className="grid gap-2 text-sm font-bold">Alasan jika ditolak<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} maxLength={300} placeholder="Contoh: nominal atau bukti transfer tidak sesuai" className="rounded-lg border border-border bg-background p-3 font-normal outline-none focus:border-primary" /></label>{error ? <p className="mt-3 text-sm font-semibold text-red-300">{error}</p> : null}<div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" disabled={loading !== null} onClick={() => review("reject")} className="flex items-center justify-center gap-2 rounded-lg border border-danger/70 px-4 py-3 font-bold text-red-300 disabled:opacity-60">{loading === "reject" ? <LoaderCircle className="size-5 animate-spin" /> : <X className="size-5" />}Tolak</button><button type="button" disabled={loading !== null} onClick={() => review("approve")} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-extrabold text-primary-foreground disabled:opacity-60">{loading === "approve" ? <LoaderCircle className="size-5 animate-spin" /> : <Check className="size-5" />}Terima pembayaran</button></div></div>;
}
