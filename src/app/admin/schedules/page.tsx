import { addHours, format, startOfDay } from "date-fns";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ScheduleManager } from "@/components/admin/schedule-manager";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  const query = await searchParams;
  const today = format(new Date(), "yyyy-MM-dd");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(query.date ?? "") && query.date! >= today ? query.date! : today;
  const dayStart = startOfDay(new Date(`${date}T12:00:00+07:00`));
  const dayOfWeek = new Date(`${date}T12:00:00+07:00`).getUTCDay();
  const [courts, operating] = await Promise.all([db.court.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, include: { slots: { where: { startsAt: { gte: dayStart, lt: addHours(dayStart, 24) } }, select: { startsAt: true, status: true, blockedReason: true } } } }), db.operatingHour.findUnique({ where: { dayOfWeek } })]);
  const opensAt = operating?.isOpen ? operating.opensAt : "Tutup";
  const closesAt = operating?.isOpen ? operating.closesAt : "-";
  const startHour = operating?.isOpen ? Number(operating.opensAt.slice(0, 2)) : 0;
  const endHour = operating?.isOpen ? Number(operating.closesAt.slice(0, 2)) : 0;
  const slots = Array.from({ length: Math.max(0, endHour - startHour) }, (_, index) => `${String(startHour + index).padStart(2, "0")}:00`);
  const data = courts.map((court) => ({ id: court.id, name: court.name, slots: slots.map((time) => { const record = court.slots.find((slot) => format(slot.startsAt, "HH:mm") === time); return { time, status: record?.status ?? "AVAILABLE", reason: record?.blockedReason ?? null }; }) }));
  return <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Operasional</p><h1 className="mt-2 text-3xl font-extrabold">Kelola jadwal</h1><p className="mt-2 max-w-2xl text-muted">Blokir slot untuk maintenance atau turnamen. Slot yang diblokir tidak dapat dipilih pelanggan.</p><ScheduleManager date={date} courts={data} opensAt={opensAt} closesAt={closesAt} /></div>;
}
