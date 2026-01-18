"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User } from "@/generated/prisma/client";

// --- Schema matches DB columns ---
const inventoryBatchSchema = z.object({
  variantId: z.string().min(1, "Variant is required"),
  quantity: z.string().min(0, "Quantity must be positive"),
  costPrice: z.string().min(0, "Cost is required"),
  expiryDate: z.coerce.date().optional().nullable(),
  batchNumber: z.string().optional(), // Maps to batchCode
});

type InventoryFormValues = z.infer<typeof inventoryBatchSchema>;

// --- Helper ---
async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

// --- Actions ---

export async function createBatch(data: InventoryFormValues) {
  try {
    await checkAdmin();
    const validation = inventoryBatchSchema.safeParse(data);
    if (!validation.success) return { success: false, error: "Invalid data" };

    const { variantId, quantity, costPrice, expiryDate, batchNumber } =
      validation.data;

    await prisma.$transaction([
      prisma.inventoryBatch.create({
        data: {
          variantId,
          quantityOnHand: Number(quantity),
          costPrice: Number(costPrice),
          expiryDate: expiryDate || null,
          batchCode: batchNumber || `BATCH-${Date.now()}`,
        },
      }),
      prisma.productVariant.update({
        where: { id: variantId },
        data: { stockLevel: { increment: Number(quantity) } },
      }),
    ]);

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/product-variants");
    return { success: true, message: "Stock received successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to receive stock" };
  }
}

export async function updateBatch(id: string, data: InventoryFormValues) {
  try {
    await checkAdmin();
    const validation = inventoryBatchSchema.safeParse(data);
    if (!validation.success) return { success: false, error: "Invalid data" };

    const { quantity, costPrice, expiryDate, batchNumber } = validation.data;

    const oldBatch = await prisma.inventoryBatch.findUnique({ where: { id } });
    if (!oldBatch) return { success: false, error: "Batch not found" };

    const difference = Number(quantity) - oldBatch.quantityOnHand;

    await prisma.$transaction([
      prisma.inventoryBatch.update({
        where: { id },
        data: {
          quantityOnHand: Number(quantity),
          costPrice: Number(costPrice),
          expiryDate: expiryDate || null,
          batchCode: batchNumber || oldBatch.batchCode,
        },
      }),
      // Only update master stock if quantity changed
      ...(difference !== 0
        ? [
            prisma.productVariant.update({
              where: { id: oldBatch.variantId },
              data: { stockLevel: { increment: difference } },
            }),
          ]
        : []),
    ]);

    revalidatePath("/admin/inventory");
    return { success: true, message: "Batch updated successfully" };
  } catch (error) {
    return { success: false, error: "Failed to update batch" };
  }
}

export async function deleteBatch(id: string) {
  try {
    await checkAdmin();

    const oldBatch = await prisma.inventoryBatch.findUnique({ where: { id } });
    if (!oldBatch) return { success: false, error: "Batch not found" };

    await prisma.$transaction([
      prisma.inventoryBatch.delete({ where: { id } }),
      prisma.productVariant.update({
        where: { id: oldBatch.variantId },
        data: { stockLevel: { decrement: oldBatch.quantityOnHand } }, // 👈 FIX
      }),
    ]);

    revalidatePath("/admin/inventory");
    return { success: true, message: "Batch deleted and stock adjusted" };
  } catch (error) {
    return { success: false, error: "Failed to delete batch" };
  }
}
