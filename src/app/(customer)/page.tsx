import { addDays, format, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, MapPin } from "lucide-react";
import { CourtCard } from "@/components/customer/court-card";
import { listActiveCourts } from "@/modules/courts/repository";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const query = await searchParams;
  const today = startOfDay(new Date());
  const candidate = /^\d{4}-\d{2}-\d{2}$/.test(query.date ?? "") ? startOfDay(new Date(`${query.date}T12:00:00+07:00`)) : today;
  const selectedDate = candidate >= today && candidate < addDays(today, 7) ? candidate : today;
  const courtRecords = await listActiveCourts(selectedDate);
  const courts = courtRecords.map((court) => ({
    id: court.id,
    name: court.name,
    floorType: court.floorType,
    location: "Indoor · Lantai 1",
    hourlyRate: Number(court.hourlyRate),
    availableSlots: Math.max(0, 15 - court.slots.filter((slot) => slot.status !== "HELD" || !slot.holdExpiresAt || slot.holdExpiresAt > new Date()).length),
    imageUrl: court.imageUrl ?? "/images/courts/court-1.jpg",
    date: format(selectedDate, "yyyy-MM-dd"),
  }));
  const dates = Array.from({ length: 7 }, (_, index) => addDays(today, index));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">Booking lapangan</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">Mau main kapan?</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted sm:text-lg">Pilih tanggal dan lapangan untuk mulai bermain.</p>
        </div>
        <div className="hidden rounded-lg border border-border bg-surface p-4 lg:block">
          <div className="flex items-center gap-3"><CalendarDays className="size-5 text-primary" /><div><p className="text-xs font-bold uppercase tracking-wider text-muted">Hari ini</p><p className="mt-1 font-semibold">{format(today, "EEEE, d MMMM yyyy", { locale: id })}</p></div></div>
        </div>
      </section>

      <section aria-label="Pilih tanggal" className="mt-7">
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-2 sm:gap-3">
          {dates.map((date) => (
            <a key={date.toISOString()} href={`/?date=${format(date, "yyyy-MM-dd")}`} aria-current={format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") ? "date" : undefined} className={`min-w-[82px] rounded-lg border px-4 py-3 text-center transition ${format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground hover:border-primary"}`}>
              <span className="block text-xs font-bold uppercase tracking-wider">{format(date, "EEE", { locale: id })}</span>
              <span className="mt-1 block text-2xl font-extrabold leading-none">{format(date, "d")}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><h2 className="text-2xl font-bold">Pilih lapangan</h2><p className="mt-1 text-sm text-muted">Harga dan slot tersedia untuk {format(selectedDate, "d MMMM", { locale: id })}.</p></div>
          <div className="hidden items-center gap-2 text-sm text-muted sm:flex"><MapPin className="size-4 text-primary" />Jakarta Selatan</div>
        </div>
        {courts.length > 0 ? <div className="grid gap-5 md:grid-cols-2 xl:gap-6">{courts.map((court) => <CourtCard key={court.id} court={court} />)}</div> : <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">Belum ada lapangan aktif.</div>}
      </section>
    </div>
  );
}
