import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { Prisma } from "@/generated/prisma/client";
import { OrdersTable } from "@/templates/order";

export const metadata = { title: "Orders" };

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const skip = (page - 1) * limit;

  // Search by Order Code or Customer Email
  const where: Prisma.OrderWhereInput = query
    ? {
        OR: [
          { orderCode: { contains: query, mode: "insensitive" } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const [totalCount, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } }, // Count items for quick view
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders and shipments.
        </p>
      </div>

      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersTable data={orders} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
