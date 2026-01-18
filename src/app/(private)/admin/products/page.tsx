import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { AttachmentRecordType, Prisma } from "@/generated/prisma/client";
import { ProductTable } from "@/templates/products";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 1. Pagination Parameters
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = query
    ? { name: { contains: query, mode: "insensitive" } }
    : {};

  // 3. Parallel Fetching (Primary Data)
  const [totalCount, products, brands, categories] = await Promise.all([
    // A. Total Count
    prisma.product.count({ where }),

    // B. Paginated Products
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        _count: {
          select: { variants: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit, // Limit
      skip: skip, // Offset
    }),

    // C. Dropdown Data (Must be full lists)
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // 4. Fetch Attachments (Dependent on fetched products)
  const productIds = products.map((p) => p.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Product,
      recordId: { in: productIds },
    },
  });

  // 5. Map Attachments to Products
  const productsWithImages = products.map((p) => ({
    ...p,
    attachments: attachments.filter((a) => a.recordId === p.id),
  }));

  // 6. Calculate Total Pages
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage base products catalog.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ProductTable
          data={productsWithImages}
          allBrands={brands}
          allCategories={categories}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}
