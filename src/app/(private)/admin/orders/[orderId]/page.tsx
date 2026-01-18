import { notFound } from "next/navigation";
import { prisma } from "@/config/auth";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, CreditCard, Package } from "lucide-react";
import {
  OrderStatus,
  OrderStatusSelector,
} from "@/templates/order/OrderStatusSelector";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "Paid":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "Processing":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "Shipped":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "Delivered":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  // Fetch Order with ALL relations
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      shippingAddress: true,
      payments: true,
      items: {
        include: {
          variant: {
            include: {
              product: { include: { brand: true } },
            },
          },
        },
      },
    },
  });

  if (!order) return notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            Order #{order.orderCode}
            <Badge
              className={getStatusColor(order.status as OrderStatus)}
              variant="outline"
            >
              {order.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), "PPP p")}
          </p>
        </div>

        {/* Status Changer Component */}
        <OrderStatusSelector
          orderId={order.id}
          currentStatus={order.status as OrderStatus}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Items & Payment */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between"
                  >
                    <div className="flex gap-4">
                      {/* You can add an image here using variant.product.attachments later */}
                      <div className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-md border bg-gray-100 text-xs">
                        IMG
                      </div>
                      <div>
                        <p className="font-medium">
                          {item.variant.product.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {item.variant.product.brand.name} •{" "}
                          {item.variant.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          SKU: {item.variant.sku}
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
                      <p className="mt-1 font-bold">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex flex-col gap-2 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$0.00</span>{" "}
                  {/* Logic for shipping cost if you add it later */}
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.payments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No payment records found.
                </p>
              ) : (
                <div className="space-y-4">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {payment.gateway}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          ID: {payment.transactionId}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block font-medium">
                          ${payment.amount.toFixed(2)}
                        </span>
                        <Badge
                          variant={
                            payment.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.user.name}</p>
                <p className="text-muted-foreground text-sm">
                  {order.user.email}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Registered:{" "}
                  {format(new Date(order.user.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
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
                  <p className="text-muted-foreground mt-2 text-xs uppercase">
                    {order.shippingAddress.country}
                  </p>
                  <p className="text-muted-foreground mt-2 flex items-center gap-2">
                    📞 {order.shippingAddress.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  No shipping address provided.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
