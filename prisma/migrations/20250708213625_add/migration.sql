/*
  Warnings:

  - You are about to drop the column `amount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `amountTax` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "amount",
DROP COLUMN "amountTax",
ADD COLUMN     "commission" DOUBLE PRECISION,
ADD COLUMN     "companionAmount" DOUBLE PRECISION;
