-- Add credits column to User table
ALTER TABLE "User" ADD COLUMN "credits" DOUBLE PRECISION DEFAULT 0;

-- Create CreditTransaction table
CREATE TABLE "CreditTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "totalPricePen" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "mercadoPagoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- Create unique index on mercadoPagoId
CREATE UNIQUE INDEX "CreditTransaction_mercadoPagoId_key" ON "CreditTransaction"("mercadoPagoId");

-- Add foreign key constraint
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;