/*
  Warnings:

  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nationalId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_nationalId_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `city`,
    DROP COLUMN `country`,
    DROP COLUMN `nationalId`,
    DROP COLUMN `phoneNumber`;
