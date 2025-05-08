/*
  Warnings:

  - You are about to drop the column `profileId` on the `DateType` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `Tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `DateType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `DateType` DROP FOREIGN KEY `DateType_profileId_fkey`;

-- DropForeignKey
ALTER TABLE `Tag` DROP FOREIGN KEY `Tag_profileId_fkey`;

-- DropIndex
DROP INDEX `DateType_profileId_fkey` ON `DateType`;

-- DropIndex
DROP INDEX `Tag_profileId_fkey` ON `Tag`;

-- AlterTable
ALTER TABLE `DateType` DROP COLUMN `profileId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Tag` DROP COLUMN `profileId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `_TagsToProfiles` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TagsToProfiles_AB_unique`(`A`, `B`),
    INDEX `_TagsToProfiles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_DateTypesToProfiles` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DateTypesToProfiles_AB_unique`(`A`, `B`),
    INDEX `_DateTypesToProfiles_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `DateType_name_key` ON `DateType`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Tag_name_key` ON `Tag`(`name`);

-- AddForeignKey
ALTER TABLE `_TagsToProfiles` ADD CONSTRAINT `_TagsToProfiles_A_fkey` FOREIGN KEY (`A`) REFERENCES `CompanionProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TagsToProfiles` ADD CONSTRAINT `_TagsToProfiles_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DateTypesToProfiles` ADD CONSTRAINT `_DateTypesToProfiles_A_fkey` FOREIGN KEY (`A`) REFERENCES `CompanionProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DateTypesToProfiles` ADD CONSTRAINT `_DateTypesToProfiles_B_fkey` FOREIGN KEY (`B`) REFERENCES `DateType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
