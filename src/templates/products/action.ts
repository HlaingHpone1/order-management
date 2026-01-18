"use server";

import { z } from "zod"; // You might need `zod-form-data` for cleaner file validation, but standard zod works if handled carefully
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { User, AttachmentRecordType, Prisma } from "@/generated/prisma/client";
import {
  deleteFileLocally,
  saveFileLocally,
} from "@/templates/action/fileUpload";

// --- Schema ---
// We validate separate fields because FormData values are strings/files
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  scentFamily: z.string().optional(),
  genderTarget: z.string().optional(), // "Men", "Women", "Unisex"
});

// --- Helper ---
async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

async function checkAdminOrManager() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user as User;
  if (!user || user.role === "CUSTOMER") {
    throw new Error("Unauthorized");
  }
}

// --- Actions ---

export async function createProduct(formData: FormData) {
  try {
    await checkAdminOrManager();

    // 1. Validate Text Fields
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      brandId: formData.get("brandId"),
      categoryId: formData.get("categoryId"),
      scentFamily: formData.get("scentFamily"),
      genderTarget: formData.get("genderTarget"),
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) return { success: false, error: "Invalid data" };

    // 2. Handle File Upload
    const file = formData.get("image") as File | null;
    let attachmentData = null;

    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return { success: false, error: "File must be an image" };
      }
      const uploadResult = await saveFileLocally(file, "products");
      attachmentData = uploadResult;
    }

    // 3. Create Product & Attachment (Transaction)
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: validation.data.name,
          description: validation.data.description || "",
          brandId: validation.data.brandId,
          categoryId: validation.data.categoryId,
          scentFamily: validation.data.scentFamily || null,
          genderTarget: validation.data.genderTarget || null,
        },
      });

      if (attachmentData) {
        await tx.attachment.create({
          data: {
            fileUrl: attachmentData.url,
            fileType: attachmentData.type,
            fileSizeKb: attachmentData.size / 1024,
            purpose: "main_image",
            recordType: AttachmentRecordType.Product,
            recordId: product.id,
          },
        });
      }
    });

    revalidatePath("/admin/products");
    return { success: true, message: "Product created" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await checkAdminOrManager();

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      brandId: formData.get("brandId"),
      categoryId: formData.get("categoryId"),
      scentFamily: formData.get("scentFamily"),
      genderTarget: formData.get("genderTarget"),
    };

    const validation = productSchema.safeParse(rawData);
    if (!validation.success) return { success: false, error: "Invalid data" };

    // Update Product Fields
    await prisma.product.update({
      where: { id },
      data: {
        ...validation.data,
      },
    });

    // Handle Image Replacement
    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      // 1. Find old attachment
      const oldAttachment = await prisma.attachment.findFirst({
        where: { recordId: id, recordType: AttachmentRecordType.Product },
      });

      // 2. Delete old file from disk
      if (oldAttachment) {
        await deleteFileLocally(oldAttachment.fileUrl);
        await prisma.attachment.delete({ where: { id: oldAttachment.id } });
      }

      // 3. Upload new
      const uploadResult = await saveFileLocally(file, "products");

      // 4. Create new DB record
      await prisma.attachment.create({
        data: {
          fileUrl: uploadResult.url,
          fileType: uploadResult.type,
          fileSizeKb: uploadResult.size / 1024,
          purpose: "main_image",
          recordType: AttachmentRecordType.Product,
          recordId: id,
        },
      });
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product updated" };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await checkAdmin();

    const variantCount = await prisma.productVariant.count({
      where: { productId: id },
    });

    if (variantCount > 0) {
      return {
        success: false,
        error: `Cannot delete: This product has ${variantCount} variants. Please delete them first.`,
      };
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });

    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      const orderCount = await prisma.orderItem.count({
        where: {
          variantId: { in: variantIds },
        },
      });

      if (orderCount > 0) {
        return {
          success: false,
          error: `Cannot delete: This product has been ordered ${orderCount} times. Archive it instead.`,
        };
      }
    }

    // 3. Cleanup Images (Attachments)
    const attachments = await prisma.attachment.findMany({
      where: { recordId: id, recordType: AttachmentRecordType.Product },
    });

    for (const att of attachments) {
      await deleteFileLocally(att.fileUrl);
    }

    await prisma.attachment.deleteMany({
      where: { recordId: id, recordType: AttachmentRecordType.Product },
    });

    // 4. Finally Delete the Product
    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Delete product error:", error);
    // Handle Prisma Foreign Key constraint errors specifically if they slip through
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          success: false,
          error: "Cannot delete: Related records exist.",
        };
      }
    }
    return { success: false, error: "Failed to delete product" };
  }
}
