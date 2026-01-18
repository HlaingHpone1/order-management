import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/config/auth";
import { Sparkles, Shield, Truck, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AttachmentRecordType } from "@/generated/prisma/enums";
import Image from "next/image";

export default async function Home() {
  const t = await getTranslations();

  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      category: true,
      variants: {
        take: 1, // Get the starting price from the first variant
        orderBy: { price: "asc" },
      },
    },
  });

  // 2. Fetch Images for these Products
  // We filter by the product IDs we just fetched and ensure the type is 'Product'
  const productIds = products.map((p) => p.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Product,
      recordId: { in: productIds },
    },
  });

  // 3. Merge Products with their Images
  const productsWithImages = products.map((product) => {
    const mainImage = attachments.find((img) => img.recordId === product.id);
    return {
      ...product,
      imageUrl: mainImage ? mainImage.fileUrl : "/images/placeholder.jpeg",
      startingPrice: product.variants[0]?.price || 0,
    };
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-foreground mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              {t("page.home.heroTitleMain")}
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("page.home.heroTitleHighlight")}
              </span>
            </h1>
            <p className="text-muted-foreground mb-8 text-lg md:text-xl">
              {t("page.home.heroSubtitle")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/products">{t("cta.shopCollection")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">{t("cta.learnMore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 rounded-full p-4">
                <Sparkles className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("page.home.features.premiumTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("page.home.features.premiumDescription")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 rounded-full p-4">
                <Shield className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("page.home.features.secureTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("page.home.features.secureDescription")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 rounded-full p-4">
                <Truck className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("page.home.features.deliveryTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("page.home.features.deliveryDescription")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 mb-4 rounded-full p-4">
                <Heart className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("page.home.features.careTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("page.home.features.careDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container px-4">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-gray-900">
          New Arrivals
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {productsWithImages.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="aspect-h-1 aspect-w-1 xl:aspect-h-8 xl:aspect-w-7 w-full overflow-hidden rounded-lg bg-gray-200">
                <Image
                  unoptimized
                  src={product.imageUrl}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.brand.name}</p>
              <p className="mt-1 text-lg font-medium text-gray-900">
                ${product.startingPrice.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("page.home.ctaTitle")}
            </h2>
            <p className="mb-8 text-lg opacity-90">
              {t("page.home.ctaSubtitle")}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">{t("cta.exploreProducts")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
