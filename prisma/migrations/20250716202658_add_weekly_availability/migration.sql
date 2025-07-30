-- AlterTable
ALTER TABLE "CompanionProfile" ADD COLUMN     "availableFriday" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availableMonday" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availableSaturday" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availableSunday" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availableThursday" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availableTuesday" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "availableWednesday" BOOLEAN NOT NULL DEFAULT true;
