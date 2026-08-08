import { Prisma, type CourtPriceRule } from "@prisma/client";

type PriceRule = Pick<CourtPriceRule, "dayOfWeek" | "startsAt" | "endsAt" | "hourlyRate" | "updatedAt">;

/** Resolves the price for one 60-minute slot. A day-specific rule wins over an all-days rule. */
export function resolveSlotPrice(baseRate: Prisma.Decimal, rules: PriceRule[], dayOfWeek: number, time: string) {
  const matching = rules
    .filter((rule) => rule.startsAt <= time && time < rule.endsAt && (rule.dayOfWeek === null || rule.dayOfWeek === dayOfWeek))
    .sort((a, b) => Number(b.dayOfWeek !== null) - Number(a.dayOfWeek !== null) || b.updatedAt.getTime() - a.updatedAt.getTime());
  return matching[0]?.hourlyRate ?? baseRate;
}
