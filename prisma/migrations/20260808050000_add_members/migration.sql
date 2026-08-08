ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MEMBER';

ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "Booking" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
