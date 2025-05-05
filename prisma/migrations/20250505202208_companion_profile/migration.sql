/*
  Warnings:

  - You are about to drop the column `averageRating` on the `CompanionProfile` table. All the data in the column will be lost.
  - You are about to drop the column `hobbies` on the `CompanionProfile` table. All the data in the column will be lost.
  - You are about to drop the `AppointmentType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deparment` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexualOrientation` to the `CompanionProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AppointmentType` DROP FOREIGN KEY `AppointmentType_profileId_fkey`;

-- AlterTable
ALTER TABLE `CompanionProfile` DROP COLUMN `averageRating`,
    DROP COLUMN `hobbies`,
    ADD COLUMN `contry` VARCHAR(191) NULL,
    ADD COLUMN `deparment` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `district` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL,
    ADD COLUMN `height` DOUBLE NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `rating` DOUBLE NULL DEFAULT 5.0,
    ADD COLUMN `sexualOrientation` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `hourlyRate` DOUBLE NULL;

-- DropTable
DROP TABLE `AppointmentType`;

-- CreateTable
CREATE TABLE `DateType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DateType` ADD CONSTRAINT `DateType_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `CompanionProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
