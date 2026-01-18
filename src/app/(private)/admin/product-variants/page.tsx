import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { Prisma } from "@/generated/prisma/client";
import { VariantsTable } from "@/templates/product-variants";

export const metadata = { title: "Product Variants" };

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductVariantsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20; // Variants might need a higher limit
  const skip = (page - 1) * limit;

  // Search by Variant Name, SKU, or Product Name
  const where: Prisma.ProductVariantWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { product: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const [totalCount, variants, products] = await Promise.all([
    // 1. Count
    prisma.productVariant.count({ where }),

    // 2. Fetch Variants (with Product info)
    prisma.productVariant.findMany({
      where,
      include: {
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),

    // 3. Fetch All Products (for the Create Modal Dropdown)
    prisma.product.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Variants</h1>
        <p className="text-muted-foreground">
          Global view of all SKUs and inventory configurations.
        </p>
      </div>

      <Suspense fallback={<div>Loading variants...</div>}>
        <VariantsTable
          data={variants}
          allProducts={products}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}
