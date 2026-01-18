"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { ShoppingBag, Check, Info, Loader2 } from "lucide-react";
import { useSession } from "@/config/auth-client";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { Product, Brand, ProductVariant } from "@/generated/prisma/client";

// --- Types (Same as before) ---
interface ProductSpecs {
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  intensity?: string;
  longevity?: string;
  sillage?: string;
}

type ProductWithRelations = Product & {
  brand: Brand;
  variants: ProductVariant[];
};

type AttachmentData = {
  recordId: string;
  fileUrl: string;
  recordType: "Product" | "ProductVariant";
};

// --- Sub-Component: Image Gallery (Same as before) ---
function ImageGallery({
  images,
  productName,
}: {
  images: AttachmentData[];
  productName: string;
}) {
  const [activeImage, setActiveImage] = useState<string | null>(
    images[0]?.fileUrl || null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-gray-50">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <span className="text-6xl">🌸</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={`${img.recordId}-${idx}`}
              onClick={() => setActiveImage(img.fileUrl)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2",
                activeImage === img.fileUrl
                  ? "border-primary"
                  : "border-transparent hover:border-gray-200",
              )}
            >
              <Image
                src={img.fileUrl}
                alt="Thumbnail"
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---
export function ProductView({
  product,
  attachments,
}: {
  product: ProductWithRelations;
  attachments: AttachmentData[];
}) {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession(); // Auth check

  const addItem = useCartStore((state) => state.addItem); // Zustand action

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id,
  );

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId,
  );

  const displayImages = useMemo(() => {
    const globalImages = attachments.filter(
      (a) => a.recordType === "Product" && a.recordId === product.id,
    );
    const variantImages = attachments.filter(
      (a) =>
        a.recordType === "ProductVariant" && a.recordId === selectedVariantId,
    );
    return [...variantImages, ...globalImages];
  }, [attachments, product.id, selectedVariantId]);

  // Handler for Add to Cart
  const handleAddToCart = () => {
    // 1. Check Authentication
    if (!session) {
      toast.error("Please log in to add items to your cart");
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    if (!selectedVariant) return;

    // 2. Add to Store
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: `${product.name} - ${selectedVariant.name}`,
      price: selectedVariant.price,
      image: displayImages[0]?.fileUrl,
      quantity: 1,
      concentration: selectedVariant.concentration,
      size: `${selectedVariant.volumeMl}ml`,
    });

    toast.success("Added to cart");
  };

  if (!selectedVariant) return <div>Variant not found</div>;

  // Cast specs (Same as before)
  const specs =
    selectedVariant.specifications as unknown as ProductSpecs | null;

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      <ImageGallery
        key={selectedVariantId}
        images={displayImages}
        productName={product.name}
      />

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-muted-foreground text-lg font-medium">
            {product.brand.name}
          </h2>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              {product.scentFamily}
            </span>
          </div>
        </div>

        <div className="flex items-end gap-4">
          <p className="text-primary text-3xl font-bold tracking-tight">
            ${selectedVariant.price.toFixed(2)}
          </p>
          <div className="text-muted-foreground mb-1 text-sm">
            {/* Stock logic same as before */}
            Stock:{" "}
            {selectedVariant.stockLevel > 0 ? (
              <span className="text-green-600">
                {selectedVariant.stockLevel} Available
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Variant Selector */}
        <div className="space-y-3">
          {/* Same variant selector code as before */}
          <div className="flex flex-wrap gap-3">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "focus:border-primary relative flex cursor-pointer flex-col items-start rounded-lg border p-3 text-sm shadow-sm transition-all outline-none hover:border-gray-400",
                  selectedVariantId === variant.id
                    ? "border-primary bg-primary/5 ring-primary ring-1"
                    : "border-gray-200 bg-white",
                )}
              >
                <div className="flex w-full justify-between gap-2">
                  <span className="font-semibold text-gray-900">
                    {variant.volumeMl}ml
                  </span>
                  {selectedVariantId === variant.id && (
                    <Check className="text-primary h-4 w-4" />
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {variant.concentration}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        <div className="flex gap-4">
          <Button
            size="lg"
            className="w-full flex-1"
            disabled={selectedVariant.stockLevel <= 0 || isAuthPending}
            onClick={handleAddToCart}
          >
            {isAuthPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 h-4 w-4" />
            )}
            {selectedVariant.stockLevel > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>

        {/* Description & Notes (Same as before) */}
        <div className="space-y-4 pt-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4" /> Description
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          </div>
          {/* Specs Grid... */}
        </div>
      </div>
    </div>
  );
}
