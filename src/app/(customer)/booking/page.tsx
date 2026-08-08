import Link from "next/link";
import { BookingForm } from "@/components/customer/booking-form";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ date?: string; court?: string; slots?: string }> }) {
  const query = await searchParams;
  const times = [...new Set((query.slots ?? "").split(",").filter((time) => /^([01]\d|2[0-3]):00$/.test(time)))].sort();
  const court = query.court ? await db.court.findFirst({ where: { id: query.court, isActive: true } }) : null;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(query.date ?? "");

  if (!court || !validDate || times.length === 0) return <div className="mx-auto max-w-2xl px-4 py-12 text-center"><h1 className="text-3xl font-bold">Jadwal belum dipilih</h1><p className="mt-3 text-muted">Kembali ke halaman jadwal dan pilih waktu bermain terlebih dahulu.</p><Link href="/jadwal" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">Pilih jadwal</Link></div>;

  return <BookingForm court={{ id: court.id, name: court.name, floorType: court.floorType, hourlyRate: Number(court.hourlyRate), imageUrl: court.imageUrl ?? "/images/courts/court-1.jpg" }} date={query.date!} times={times} />;
}
