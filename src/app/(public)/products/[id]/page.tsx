import { notFound } from "next/navigation";
import { prisma } from "@/config/auth";
import { ProductView } from "@/components/product-view";
import { AttachmentRecordType } from "@/generated/prisma/client";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} by ${product.brand.name} - FragranceHub`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  // 1. Fetch Main Product
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      variants: {
        orderBy: { price: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch Related Products (Same Category, exclude current)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4, // Limit to 4 items
    include: {
      brand: true,
      variants: {
        take: 1,
        orderBy: { price: "asc" },
      },
    },
  });

  // 3. Fetch Images (For Main Product AND Related Products)
  const relatedProductIds = relatedProducts.map((p) => p.id);
  const allRelevantIds = [
    product.id,
    ...product.variants.map((v) => v.id),
    ...relatedProductIds,
  ];

  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: {
        in: [AttachmentRecordType.Product, AttachmentRecordType.ProductVariant],
      },
      recordId: { in: allRelevantIds },
    },
    select: {
      recordId: true,
      fileUrl: true,
      recordType: true,
    },
  });

  const mainProductAttachments = attachments
    .filter(
      (a) =>
        a.recordId === product.id ||
        product.variants.some((v) => v.id === a.recordId),
    )
    .map((a) => ({
      ...a,
      recordType: a.recordType as "Product" | "ProductVariant",
    }));

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground mb-8 flex items-center text-sm">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium text-gray-900">{product.name}</span>
        </nav>

        {/* Main Product View */}
        <ProductView product={product} attachments={mainProductAttachments} />

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
              You Might Also Like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => {
                const variant = related.variants[0];
                const image = attachments.find(
                  (a) =>
                    a.recordType === AttachmentRecordType.Product &&
                    a.recordId === related.id,
                );

                return (
                  <Link
                    key={related.id}
                    href={`/products/${related.id}`}
                    className="group bg-card rounded-lg border p-4 transition-all hover:shadow-lg"
                  >
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                      {image ? (
                        <Image
                          src={image.fileUrl}
                          alt={related.name}
                          fill
                          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <span className="text-4xl">🌸</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium">
                        {related.brand.name}
                      </p>
                      <h3 className="group-hover:text-primary text-base font-semibold text-gray-900 transition-colors">
                        {related.name}
                      </h3>
                      {variant && (
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-primary font-bold">
                            ${variant.price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
