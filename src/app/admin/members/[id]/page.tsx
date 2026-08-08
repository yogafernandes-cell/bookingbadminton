import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) { const session = await getServerSession(authOptions); if (!session) redirect("/admin/login"); const { id } = await params; const member = await db.user.findFirst({ where: { id, role: "MEMBER" }, include: { bookings: { include: { items: { include: { court: true }, orderBy: { startsAt: "asc" } } }, orderBy: { createdAt: "desc" } } } }); if (!member) notFound(); return <div><Link href="/admin/members" className="text-sm font-bold text-primary">← Kembali ke member</Link><h1 className="mt-4 text-3xl font-extrabold">{member.name}</h1><p className="mt-2 text-muted">{member.email} · {member.phone ?? "-"}</p><h2 className="mt-8 text-2xl font-bold">Jadwal booking</h2><div className="mt-4 grid gap-3">{member.bookings.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">Belum ada booking.</p> : member.bookings.map((booking) => <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="rounded-xl border border-border bg-surface p-5 hover:border-primary"><div className="flex flex-wrap justify-between gap-3"><div><div className="flex gap-2"><p className="font-mono font-extrabold text-primary">{booking.code}</p><BookingStatusBadge status={booking.status} /></div>{booking.items.map((item) => <p key={item.id} className="mt-2 text-sm"><strong>{item.court.name}</strong> · {format(item.startsAt, "EEEE, d MMM yyyy HH:mm", { locale: localeId })}</p>)}</div><p className="font-extrabold">{rupiah.format(Number(booking.totalAmount))}</p></div></Link>)}</div></div>; }
