import { prisma } from "@/config/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Prisma, AttachmentRecordType } from "@/generated/prisma/client";
import Image from "next/image";
import CustomPagination from "@/components/custom-pagination";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - FragranceHub",
  description: "Browse our collection of luxury fragrances",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const t = await getTranslations();

  // 1. Parse Search Params
  const params = await searchParams;
  const { category, search } = params || {};
  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 10;
  const skip = (page - 1) * limit;

  // 2. Build Filter Conditions
  const where: Prisma.ProductWhereInput = {};

  if (category) {
    where.category = {
      OR: [
        { slug: category }, // Direct match
        { parentCategory: { slug: category } }, // Match parent (e.g. "Men's Fragrances")
      ],
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
      { scentFamily: { contains: search, mode: "insensitive" } },
    ];
  }

  // 3. Fetch Products & Total Count (Transaction for performance)
  const [products, totalCount] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        variants: {
          take: 1,
          orderBy: { price: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // 4. Fetch Images for these Products
  const productIds = products.map((p) => p.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Product,
      recordId: { in: productIds },
    },
  });

  // Merge images into products
  const productsWithImages = products.map((product) => {
    const image = attachments.find((a) => a.recordId === product.id);
    return {
      ...product,
      imageUrl: image ? image.fileUrl : null,
    };
  });

  // 5. Fetch Categories for Filters
  const categories = await prisma.category.findMany({
    where: { parentCategoryId: null },
    include: {
      _count: { select: { products: true } },
      subCategories: {
        include: {
          _count: { select: { products: true } },
        },
      },
    },
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">
            {t("page.products.title")}
          </h1>
          <p className="text-muted-foreground">{t("page.products.subtitle")}</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!category ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href="/products">{t("page.products.filterAll")}</Link>
            </Button>
            {categories.map((cat) => {
              const subCategoryCount = cat.subCategories.reduce(
                (acc, sub) => acc + sub._count.products,
                0,
              );
              const totalCatCount = cat._count.products + subCategoryCount;

              return (
                <Button
                  key={cat.id}
                  variant={category === cat.slug ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href={`/products?category=${cat.slug}`}>
                    {cat.name} ({totalCatCount})
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {productsWithImages.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsWithImages.map((product) => {
                const variant = product.variants[0];
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group bg-card rounded-lg border p-6 transition-all hover:shadow-lg"
                  >
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <span className="text-4xl">🌸</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm font-medium">
                        {product.brand.name}
                      </p>
                      <h3 className="group-hover:text-primary text-xl font-semibold transition-colors">
                        {product.name}
                      </h3>
                      {product.scentFamily && (
                        <p className="text-muted-foreground text-sm">
                          {product.scentFamily}
                        </p>
                      )}
                      {variant && (
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-primary text-lg font-bold">
                            ${variant.price.toFixed(2)}
                          </p>
                          {variant.stockLevel > 0 ? (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Component */}
            <CustomPagination totalPages={totalPages} />
          </>
        ) : (
          <div className="py-12 text-center">
            <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-semibold">
              {t("page.products.emptyTitle")}
            </h3>
            <p className="text-muted-foreground">
              {t("page.products.emptyDescription")}
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/products">{t("cta.viewAllProducts")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
