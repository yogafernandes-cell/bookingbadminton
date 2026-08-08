"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

export function PaymentCountdown({ dueAt, initialStatus }: { dueAt: string; initialStatus: string }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(dueAt).getTime() - Date.now()));
  useEffect(() => { const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(dueAt).getTime() - Date.now())), 1000); return () => window.clearInterval(timer); }, [dueAt]);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const expired = remaining === 0 || initialStatus === "EXPIRED";
  return <div className={`rounded-lg border-l-4 p-5 text-center ${expired ? "border-danger bg-danger/10" : "border-warning bg-warning/10"}`}><p className="text-xs font-bold uppercase tracking-widest text-muted">{expired ? "Waktu pembayaran habis" : "Bayar sebelum"}</p><p className={`mt-2 flex items-center justify-center gap-2 text-3xl font-extrabold ${expired ? "text-red-300" : "text-warning"}`}><Clock3 className="size-7" />{expired ? "Kedaluwarsa" : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}</p></div>;
}
