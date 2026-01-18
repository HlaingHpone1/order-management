-- AlterEnum
ALTER TYPE "AttachmentRecordType" ADD VALUE 'InventoryBatch';

-- CreateTable
CREATE TABLE "inventory_batch" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_batch_variantId_idx" ON "inventory_batch"("variantId");

-- CreateIndex
CREATE INDEX "inventory_batch_expiryDate_idx" ON "inventory_batch"("expiryDate");

-- AddForeignKey
ALTER TABLE "inventory_batch" ADD CONSTRAINT "inventory_batch_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
