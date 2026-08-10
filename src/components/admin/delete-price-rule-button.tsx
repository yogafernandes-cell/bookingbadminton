"use client";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function DeletePriceRuleButton({ id }: { id: string }) { const router = useRouter(); const [busy, setBusy] = useState(false); async function remove() { if (!window.confirm("Hapus aturan harga ini?")) return; setBusy(true); const response = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" }); if (response.ok) router.refresh(); else setBusy(false); } return <button onClick={remove} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-danger/50 px-3 py-2 text-sm font-bold text-red-300 disabled:opacity-60"><Trash2 className="size-4" />{busy ? "Menghapus..." : "Hapus"}</button>; }
