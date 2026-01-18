import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { InventoryTable } from "@/templates/inventory";

export const metadata = { title: "Inventory Management" };

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const skip = (page - 1) * limit;

  // 1. Fetch Batches (Paginated)
  // Ordered by Expiry Date (Ascending) so expiring items show first
  const [totalCount, batches] = await Promise.all([
    prisma.inventoryBatch.count(),
    prisma.inventoryBatch.findMany({
      include: {
        variant: {
          include: { product: true }, // Need product name
        },
      },
      orderBy: [
        { expiryDate: "asc" }, // Show expiring first
        { createdAt: "desc" },
      ],
      take: limit,
      skip: skip,
    }),
  ]);

  // 2. Fetch All Variants for the "Receive Stock" dropdown
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { sku: "asc" },
  });

  // Map variants to simple shape for client
  const variantOptions = variants.map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    productName: v.product.name,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage stock batches, expiry dates, and supply intake.
        </p>
      </div>

      <Suspense fallback={<div>Loading inventory...</div>}>
        <InventoryTable
          data={batches}
          totalPages={totalPages}
          variants={variantOptions}
        />
      </Suspense>
    </div>
  );
}
