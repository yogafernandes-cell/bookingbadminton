import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ManualBookingForm } from "@/components/admin/manual-booking-form";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function ManualBookingsPage() { const s = await getServerSession(authOptions); if (!s) redirect("/admin/login"); const courts = await db.court.findMany({ where: { isActive: true }, select: { id: true, name: true } }); return <div><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Operasional</p><h1 className="mt-2 text-3xl font-extrabold">Booking manual</h1><p className="mt-2 text-muted">Catat walk-in atau booking dari WhatsApp. Slot langsung dikunci.</p><ManualBookingForm courts={courts} /></div>; }
