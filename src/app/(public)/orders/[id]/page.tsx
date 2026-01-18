import { auth } from "@/config/auth";
import { prisma } from "@/config/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeft, MapPin, Package, CreditCard, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AttachmentRecordType } from "@/generated/prisma/client";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Order #${id} - FragranceHub` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/login?callbackUrl=/orders/${id}`);
  }

  // Fetch Order with relations
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shippingAddress: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { brand: true },
              },
            },
          },
        },
      },
    },
  });

  // Security: Ensure order exists and belongs to current user
  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  // Fetch Images for items
  const variantIds = order.items.map((i) => i.variantId);
  const productIds = order.items.map((i) => i.variant.productId);

  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: {
        in: [AttachmentRecordType.Product, AttachmentRecordType.ProductVariant],
      },
      recordId: { in: [...variantIds, ...productIds] },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="text-muted-foreground hover:text-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Order {order.orderCode}
              </h1>
            </div>
            <p className="text-muted-foreground mt-1 pl-7 text-sm">
              Placed on {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <StatusBadge status={order.status} size="lg" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content (Items) */}
          <div className="space-y-6 md:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-gray-50/50 px-6 py-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Package className="h-4 w-4" /> Order Items
                </h2>
              </div>
              <div className="divide-y p-6">
                {order.items.map((item) => {
                  // Find image: Try variant image first, then product image
                  const img =
                    attachments.find((a) => a.recordId === item.variantId) ||
                    attachments.find(
                      (a) => a.recordId === item.variant.productId,
                    );

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                        {img ? (
                          <Image
                            src={img.fileUrl}
                            alt={item.variant.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl">
                            🌸
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.variant.product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.variant.name} ({item.variant.volumeMl}ml)
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {item.variant.product.brand.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${item.unitPrice.toFixed(2)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar (Details) */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <CreditCard className="h-4 w-4" /> Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  {/* Calculating subtotal manually from items since we only stored totalAmount */}
                  <span>
                    $
                    {order.items
                      .reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.totalAmount > 150
                      ? "Free"
                      : `$${(order.totalAmount - order.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)).toFixed(2)}`}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            {order.shippingAddress && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Truck className="h-4 w-4" /> Shipping Details
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.recipientName}
                  </p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                    <MapPin className="h-3 w-3" /> Tracking:{" "}
                    {order.trackingNumber || "Pending"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  size = "default",
}: {
  status: string;
  size?: "default" | "lg";
}) {
  const styles: Record<string, string> = {
    Placed: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
    Processing:
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
    Shipped:
      "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200",
    Delivered:
      "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
    Cancelled: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
  };

  return (
    <Badge
      className={`${styles[status] || "bg-gray-100 text-gray-700"} ${size === "lg" ? "px-4 py-1 text-base" : ""}`}
      variant="outline"
    >
      {status}
    </Badge>
  );
}
