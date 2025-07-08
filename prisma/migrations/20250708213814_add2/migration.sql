/*
  Warnings:

  - Made the column `amountPerHour` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amountTotal` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `commission` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companionAmount` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "amountPerHour" SET NOT NULL,
ALTER COLUMN "amountTotal" SET NOT NULL,
ALTER COLUMN "commission" SET NOT NULL,
ALTER COLUMN "companionAmount" SET NOT NULL;
