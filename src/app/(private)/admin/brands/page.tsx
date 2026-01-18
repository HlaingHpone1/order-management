import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { BrandsTable } from "@/templates/brand";
import { Prisma } from "@/generated/prisma/client";

export const metadata = {
  title: "Brands Management - Admin",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BrandsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 1. Parse Parameters
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  // 2. Define Filter (Reuse for both Count and Find)
  const where: Prisma.BrandWhereInput = query
    ? {
        name: { contains: query, mode: "insensitive" },
      }
    : {};

  // 3. Fetch Data & Total Count in Parallel
  const [totalCount, brands] = await Promise.all([
    // Query A: Get total number of matching items
    prisma.brand.count({ where }),

    // Query B: Get the actual data for the current page
    prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
      take: limit, // Limit
      skip: skip, // Offset
    }),
  ]);

  // 4. Calculate Total Pages
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
        <p className="text-muted-foreground">
          Manage perfume houses and manufacturers.
        </p>
      </div>

      <Suspense fallback={<div>Loading brands...</div>}>
        <BrandsTable data={brands} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
