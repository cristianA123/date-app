-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_locationId_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "locationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
