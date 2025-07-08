-- AlterTable
ALTER TABLE "CompanionProfile" ADD COLUMN     "availableFrom" TEXT DEFAULT '00:00',
ADD COLUMN     "availableUntil" TEXT DEFAULT '23:59',
ADD COLUMN     "maxBookingHours" INTEGER DEFAULT 1;
