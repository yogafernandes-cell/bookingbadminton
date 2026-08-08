import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function AdminMembersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const members = await db.user.findMany({ where: { role: "MEMBER" }, include: { _count: { select: { bookings: true } } }, orderBy: { createdAt: "desc" } });
  return <div><p className="text-sm font-bold uppercase tracking-[.18em] text-primary">Pelanggan</p><h1 className="mt-2 text-3xl font-extrabold">Data member</h1><p className="mt-2 text-muted">Daftar akun member dan jumlah booking yang tersimpan.</p><div className="mt-7 grid gap-3">{members.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">Belum ada member terdaftar.</div> : members.map((member) => <Link key={member.id} href={`/admin/members/${member.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 hover:border-primary"><div><h2 className="font-extrabold">{member.name}</h2><p className="mt-1 text-sm text-muted">{member.email}</p><p className="mt-1 text-sm text-muted">{member.phone ?? "WhatsApp belum diisi"}</p><p className="mt-2 text-xs text-muted">Terdaftar {format(member.createdAt, "d MMMM yyyy", { locale: id })}</p></div><div className="text-right"><p className="text-2xl font-extrabold text-primary">{member._count.bookings}</p><p className="text-xs font-bold uppercase tracking-wider text-muted">Booking</p></div></Link>)}</div><Link href="/admin/bookings" className="mt-6 inline-flex text-sm font-bold text-primary">Lihat semua booking →</Link></div>;
}
