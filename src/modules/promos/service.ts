import "server-only";
import { Prisma, PromoType } from "@prisma/client";

export function calculatePromoDiscount(promo: { type: PromoType; value: Prisma.Decimal; minAmount: Prisma.Decimal | null; maxDiscount: Prisma.Decimal | null }, subtotal: Prisma.Decimal) {
  if (promo.minAmount && subtotal.lessThan(promo.minAmount)) return new Prisma.Decimal(0);
  const raw = promo.type === "PERCENTAGE" ? subtotal.mul(promo.value).div(100) : promo.value;
  const capped = promo.maxDiscount && raw.greaterThan(promo.maxDiscount) ? promo.maxDiscount : raw;
  return Prisma.Decimal.min(capped, subtotal);
}
