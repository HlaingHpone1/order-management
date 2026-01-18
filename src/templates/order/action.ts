"use server";

import { z } from "zod";
import { prisma } from "@/config/auth";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { OrderStatus, User } from "@/generated/prisma/client";

// --- Validation Schemas ---

const shippingSchema = z.object({
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const cartItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().min(1),
});

const createOrderSchema = z.object({
  items: z.array(cartItemSchema),
  shippingAddress: shippingSchema,
  paymentGateway: z.enum(["Stripe", "PayPal", "COD", "BankTransfer"]),
  transactionId: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function placeOrder(input: CreateOrderInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "You must be logged in to place an order.",
    };
  }

  const { items, shippingAddress, paymentGateway, transactionId } = input;
  const userId = session.user.id;

  // Fetch variants to check stock and price
  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: {
      id: true,
      price: true,
      stockLevel: true,
      name: true,
      product: { select: { name: true } },
    },
  });

  let totalAmount = 0;
  const orderItemsData: {
    variantId: string;
    quantity: number;
    unitPrice: number;
  }[] = [];

  for (const item of items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant)
      return { success: false, error: `Variant not found: ${item.variantId}` };

    if (variant.stockLevel < item.quantity) {
      const productName = variant.product?.name || "Product";
      return {
        success: false,
        error: `Insufficient stock for "${productName}".`,
      };
    }

    totalAmount += variant.price * item.quantity;
    orderItemsData.push({
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price,
    });
  }

  const shippingCost = totalAmount > 150 ? 0 : 15.0;
  const finalTotal = totalAmount + shippingCost;

  try {
    const { order } = await prisma.$transaction(async (tx) => {
      // 1. Stock Check (Race condition prevention)
      for (const item of items) {
        const currentVariant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!currentVariant || currentVariant.stockLevel < item.quantity) {
          throw new Error(
            `Stock changed during checkout for ${currentVariant?.name}`,
          );
        }
      }

      const initialOrderStatus = paymentGateway === "COD" ? "Placed" : "Paid";
      const initialPaymentStatus =
        paymentGateway === "COD" ? "Pending" : "Completed";

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderCode: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          totalAmount: finalTotal,
          status: initialOrderStatus, // Updated status logic
          shippingAddress: {
            create: { ...shippingAddress },
          },
          items: {
            create: orderItemsData,
          },
        },
      });

      // 4. 👇 CREATE PAYMENT RECORD HERE
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          gateway: paymentGateway,
          amount: finalTotal,
          status: initialPaymentStatus,
          // If no transaction ID provided (like for COD), generate a placeholder
          transactionId:
            transactionId ||
            `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      });

      // 5. Decrement Stock
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockLevel: { decrement: item.quantity } },
        });
      }

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          entityType: "Order",
          entityId: newOrder.id,
          action: "ORDER_PLACED",
          changedBy: userId,
          metadata: {
            totalAmount: finalTotal,
            paymentMethod: paymentGateway,
          },
        },
      });

      return { order: newOrder };
    });

    revalidatePath("/products");
    revalidatePath("/dashboard/orders");

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order placement error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Something went wrong." };
  }
}

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as User;
  if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }
}

// --- Update Status Action ---
const updateStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
});

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await checkAdmin();

    const validation = updateStatusSchema.safeParse({ orderId, status });
    if (!validation.success) return { success: false, error: "Invalid data" };

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: true, message: "Order status updated" };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}
