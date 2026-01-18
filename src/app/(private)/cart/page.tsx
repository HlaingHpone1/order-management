import { CartView } from "@/components/cart-view";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shopping Cart - FragranceHub",
  description: "Review your items and checkout",
};

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground mb-8 flex items-center text-sm">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium text-gray-900">Cart</span>
        </nav>

        <CartView />
      </div>
    </div>
  );
}
