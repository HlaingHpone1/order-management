import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { CategoriesTable } from "@/templates/category";
import { Prisma } from "@/generated/prisma/client";

export const metadata = {
  title: "Category Management - Admin",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 1. Pagination Parameters
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  // 2. Define Filter (Reuse for both data and count)
  const where: Prisma.CategoryWhereInput = query
    ? {
        name: { contains: query, mode: "insensitive" },
      }
    : {};

  // 3. Parallel Fetching
  const [totalCount, categories, allCategories] = await Promise.all([
    // A. Count matching categories (for pagination)
    prisma.category.count({ where }),

    // B. Fetch Paginated Data
    prisma.category.findMany({
      where,
      include: {
        parentCategory: true,
        _count: {
          select: { products: true, subCategories: true },
        },
      },
      orderBy: [{ parentCategoryId: "desc" }, { name: "asc" }],
      take: limit, // Limit
      skip: skip, // Offset
    }),

    // C. Fetch ALL categories for the "Parent" dropdown
    // (This must remain un-paginated and un-filtered so the modal works correctly)
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // 4. Calculate Total Pages
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Manage product categories and sub-categories.
        </p>
      </div>

      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesTable
          data={categories}
          allCategories={allCategories}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}
