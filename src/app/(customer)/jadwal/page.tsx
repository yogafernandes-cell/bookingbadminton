import { addDays, format, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { SchedulePicker, type ScheduleDay } from "@/components/customer/schedule-picker";
import { getScheduleWindow } from "@/modules/schedules/repository";
import { resolveSlotPrice } from "@/modules/courts/pricing";

export const dynamic = "force-dynamic";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ court?: string; date?: string }> }) {
  const { court: requestedCourt, date: requestedDate } = await searchParams;
  const now = new Date();
  const today = startOfDay(now);
  const requestedStart = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate ?? "") ? startOfDay(new Date(`${requestedDate}T12:00:00+07:00`)) : today;
  const startDate = requestedStart >= today ? requestedStart : today;
  const { courts, operatingHours, slots: storedSlots, priceRules } = await getScheduleWindow(7, startDate);
  const slotState = new Map(storedSlots.map((slot) => {
    const key = `${slot.courtId}:${format(slot.startsAt, "yyyy-MM-dd")}:${format(slot.startsAt, "HH:mm")}`;
    const status = slot.status === "HELD" && slot.holdExpiresAt && slot.holdExpiresAt <= now ? "AVAILABLE" : slot.status;
    const renterName = status === "BOOKED" ? slot.booking?.customerName.trim().split(/\s+/)[0] : undefined;
    return [key, { status, renterName }] as const;
  }));

  const days: ScheduleDay[] = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startDate, index);
    const dateKey = format(date, "yyyy-MM-dd");
    const hours = operatingHours.find((item) => item.dayOfWeek === date.getDay());
    const opensAt = Number(hours?.opensAt.split(":")[0] ?? 8);
    const closesAt = Number(hours?.closesAt.split(":")[0] ?? 23);
    const times = hours?.isOpen === false ? [] : Array.from({ length: Math.max(0, closesAt - opensAt) }, (_, hourIndex) => `${String(opensAt + hourIndex).padStart(2, "0")}:00`);

    return {
      key: dateKey,
      dayName: format(date, "EEE", { locale: id }).toUpperCase(),
      dayNumber: format(date, "d"),
      fullLabel: format(date, "EEEE, d MMMM yyyy", { locale: id }),
      courts: courts.map((court) => ({
        id: court.id,
        name: court.name,
        floorType: court.floorType,
        hourlyRate: Number(court.hourlyRate),
        imageUrl: court.imageUrl ?? "/images/courts/court-1.jpg",
        slots: times.map((time) => {
          const startsAt = new Date(`${dateKey}T${time}:00+07:00`);
          const stored = slotState.get(`${court.id}:${dateKey}:${time}`);
          const status = startsAt <= now ? "BOOKED" : (stored?.status ?? "AVAILABLE");
          return { id: `${court.id}:${dateKey}:${time}`, time, price: Number(resolveSlotPrice(court.hourlyRate, priceRules.filter((rule) => rule.courtId === court.id), date.getDay(), time)), status, renterName: status === "BOOKED" ? stored?.renterName : undefined };
        }),
      })),
    };
  });

  return <SchedulePicker days={days} initialCourtId={requestedCourt} initialDate={requestedDate} />;
}
