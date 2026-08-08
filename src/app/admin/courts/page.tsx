import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CourtManager } from "@/components/admin/court-manager";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCourtsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const courtRecords = await db.court.findMany({ orderBy: { name: "asc" } });
  const courts = courtRecords.map((court) => ({ ...court, hourlyRate: Number(court.hourlyRate) }));
  return <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operasional</p><h1 className="mt-2 text-3xl font-extrabold">Kelola lapangan</h1><p className="mt-2 max-w-2xl text-muted">Atur lapangan, tarif per jam, jenis lantai, foto, dan status ketersediaan booking.</p><CourtManager courts={courts} /></div>;
}
