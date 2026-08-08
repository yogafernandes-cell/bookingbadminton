import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PromoForm } from "@/components/admin/promo-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function AdminPromosPage() { const session = await getServerSession(authOptions); if (!session) redirect("/admin/login"); const promos = await db.promo.findMany({ orderBy: { createdAt: "desc" } }); return <div><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Marketing</p><h1 className="mt-2 text-3xl font-extrabold">Promo booking</h1><p className="mt-2 text-muted">Buat kode promo yang berlaku pada periode tertentu.</p><PromoForm /><div className="mt-6 grid gap-3">{promos.map((promo) => <article key={promo.id} className="flex flex-wrap justify-between gap-3 rounded-xl border border-border bg-surface p-5"><div><p className="font-extrabold">{promo.name} <code className="ml-2 text-primary">{promo.code}</code></p><p className="mt-1 text-sm text-muted">{promo.startsAt.toLocaleDateString("id-ID")} – {promo.endsAt.toLocaleDateString("id-ID")}</p></div><p className="font-extrabold text-primary">{promo.type === "PERCENTAGE" ? `${promo.value}%` : `Rp${promo.value}`}</p></article>)}</div></div>; }
