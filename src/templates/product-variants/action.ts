"use server";

import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User, Concentration } from "@/generated/prisma/client";
import { VariantFormValues } from "@/templates/product-variants/VariantModal";

// --- Helper ---
async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createVariant(data: VariantFormValues) {
  try {
    await checkAdmin();

    // 1. Destructure to isolate the fields
    const {
      productId,
      sku,
      name,
      volumeMl,
      price,
      reorderPoint,
      isTester,
      concentration,
      weightGrams,
      // These 3 are form-only fields, DO NOT pass them to root data
      topNotes,
      middleNotes,
      baseNotes,
    } = data;

    await prisma.productVariant.create({
      data: {
        // 2. Pass only valid DB columns
        productId,
        sku,
        name,
        concentration: concentration as Concentration,
        volumeMl,
        price,
        reorderPoint,
        isTester,
        weightGrams: weightGrams || null,
        stockLevel: 0,

        // 3. Map the isolated notes into the JSON field
        specifications: {
          top: topNotes,
          middle: middleNotes,
          base: baseNotes,
        },
      },
    });

    revalidatePath("/admin/product-variants");
    return { success: true, message: "Variant created" };
  } catch (error) {
    console.error(error); // Good to log the actual error for debugging
    return { success: false, error: "Failed to create variant" };
  }
}

export async function updateVariant(id: string, data: VariantFormValues) {
  try {
    await checkAdmin();

    const {
      sku,
      name,
      concentration,
      volumeMl,
      price,
      reorderPoint,
      isTester,
      weightGrams,
      topNotes,
      middleNotes,
      baseNotes,
    } = data;

    // Check SKU Uniqueness (exclude self)
    const existingSku = await prisma.productVariant.findFirst({
      where: { sku, NOT: { id } },
    });
    if (existingSku) return { success: false, error: "SKU already exists" };

    await prisma.productVariant.update({
      where: { id },
      data: {
        sku,
        name,
        concentration: concentration as Concentration,
        volumeMl,
        price,
        reorderPoint,
        isTester,
        weightGrams: weightGrams || null,
        specifications: {
          top: topNotes,
          middle: middleNotes,
          base: baseNotes,
        },
      },
    });

    // Revalidate the specific product page or list
    revalidatePath(`/admin/product-variants`);
    return { success: true, message: "Variant updated successfully" };
  } catch (error) {
    return { success: false, error: "Failed to update variant" };
  }
}

export async function deleteVariant(id: string) {
  try {
    await checkAdmin();

    // 1. Check for Orders
    const orderCount = await prisma.orderItem.count({
      where: { variantId: id },
    });

    if (orderCount > 0) {
      return {
        success: false,
        error: `Cannot delete: This variant has been ordered ${orderCount} times.`,
      };
    }

    // 2. Check for Inventory Batches
    // (Optional: You might allow deleting if stock is 0, but safer to block)
    const batchCount = await prisma.inventoryBatch.count({
      where: { variantId: id },
    });

    if (batchCount > 0) {
      return {
        success: false,
        error: `Cannot delete: Inventory batches exist for this variant.`,
      };
    }

    await prisma.productVariant.delete({ where: { id } });

    revalidatePath(`/admin/product-variants`);
    return { success: true, message: "Variant deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete variant" };
  }
}
