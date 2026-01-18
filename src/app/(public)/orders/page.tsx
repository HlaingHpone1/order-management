import { auth } from "@/config/auth";
import { prisma } from "@/config/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, ChevronRight } from "lucide-react";

export const metadata = {
  title: "My Orders - FragranceHub",
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            View and track your past purchases.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border bg-white p-8 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold">No orders found</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t placed any orders yet.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderCode}
                    </TableCell>
                    <TableCell>
                      {format(order.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{order._count.items} items</TableCell>
                    <TableCell className="text-right font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/orders/${order.id}`}>
                          View <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Placed: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Processing: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    Shipped: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    Delivered: "bg-green-100 text-green-700 hover:bg-green-100",
    Cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
  };

  return (
    <Badge
      className={styles[status] || "bg-gray-100 text-gray-700"}
      variant="secondary"
    >
      {status}
    </Badge>
  );
}
