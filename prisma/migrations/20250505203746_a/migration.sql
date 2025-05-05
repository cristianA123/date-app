/*
  Warnings:

  - You are about to drop the column `deparment` on the `CompanionProfile` table. All the data in the column will be lost.
  - Added the required column `department` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CompanionProfile` DROP COLUMN `deparment`,
    ADD COLUMN `department` VARCHAR(191) NOT NULL;
