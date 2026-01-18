"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { useSession } from "@/config/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CreditCard,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { placeOrder } from "@/templates/order/action";
import { cn } from "@/utils";

// --- Validation Schema ---
const shippingSchema = z.object({
  recipientName: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(3, "Zip Code is required"),
  country: z.string().min(2, "Country is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

export function CartView() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();
  const { items, removeItem, updateQuantity, clearCart, getCartCount } =
    useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Payment State
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Stripe">("COD");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 150 ? 0 : 15.0;
  const total = subtotal + shippingCost;

  async function onSubmit(data: ShippingFormValues) {
    if (!session) {
      toast.error("Please log in to place an order");
      router.push("/login?callbackUrl=/cart");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Prepare Payload with Payment Info
      const orderInput = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress: data,
        paymentGateway: paymentMethod, // "COD" or "Stripe"
        // In a real app, if Stripe, you'd process payment client-side first
        // and pass the resulting ID here. For now, we simulate it if not COD.
        transactionId:
          paymentMethod === "Stripe" ? `simulated_tx_${Date.now()}` : undefined,
      };

      // @ts-ignore - Ignoring strict type check on client for the enum match
      const result = await placeOrder(orderInput);

      if (result.success) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/orders/${result.orderId}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Critical error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-gray-100 p-6">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Your cart is empty
        </h2>
        <Button asChild size="lg" className="mt-4">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      {/* LEFT COLUMN: Cart Items */}
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Shopping Cart</h2>
          <span className="text-muted-foreground">{getCartCount()} items</span>
        </div>

        <div className="mt-8 space-y-8">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 sm:gap-6">
              <div className="relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xl">🌸</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      <Link
                        href={`/products/${item.productId}`}
                        className="hover:underline"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.concentration}</span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-lg border bg-white p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="rounded-md p-1 hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="rounded-md p-1 hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Shipping & Payment */}
      <div className="lg:col-span-5">
        <div className="rounded-xl border bg-gray-50/50 p-6 shadow-sm">
          {/* 3. Payment Method Section */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod("COD")}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 text-center transition-all hover:bg-gray-50",
                  paymentMethod === "COD"
                    ? "border-black bg-white ring-1 ring-black"
                    : "bg-white",
                )}
              >
                <div className="mb-2 flex justify-center">
                  <Banknote className="h-6 w-6" />
                </div>
                <div className="font-medium">Cash on Delivery</div>
              </div>

              <div
                onClick={() => setPaymentMethod("Stripe")}
                className={cn(
                  "cursor-pointer rounded-lg border p-4 text-center transition-all hover:bg-gray-50",
                  paymentMethod === "Stripe"
                    ? "border-black bg-white ring-1 ring-black"
                    : "bg-white",
                )}
              >
                <div className="mb-2 flex justify-center">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="font-medium">Credit Card</div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Shipping Form */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold">Shipping Address</h3>

            {!session && !isAuthPending ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Please log in to checkout.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login?callbackUrl=/cart">Log In</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  id="checkout-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="USA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>

          <Separator className="my-6" />

          {/* Order Summary */}
          <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="font-medium text-green-600">Free</span>
                ) : (
                  `$${shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            className="mt-8 w-full"
            size="lg"
            disabled={!session || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay with {paymentMethod === "COD" ? "Cash" : "Card"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
