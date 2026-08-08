CREATE TABLE "CourtPriceRule" (
  "id" TEXT NOT NULL,
  "courtId" TEXT NOT NULL,
  "dayOfWeek" INTEGER,
  "startsAt" TEXT NOT NULL,
  "endsAt" TEXT NOT NULL,
  "hourlyRate" DECIMAL(12,2) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourtPriceRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CourtPriceRule_courtId_dayOfWeek_isActive_idx" ON "CourtPriceRule"("courtId", "dayOfWeek", "isActive");
ALTER TABLE "CourtPriceRule" ADD CONSTRAINT "CourtPriceRule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
