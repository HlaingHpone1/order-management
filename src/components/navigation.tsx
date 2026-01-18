"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, stringToColor } from "@/utils/index";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { LogOut, Package, ShoppingBag, User } from "lucide-react";
import { signOut, useSession } from "@/config/auth-client";
import { useCartStore } from "@/stores/useCartStore";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations("navigation");
  const tCta = useTranslations("cta");

  // Get session data
  const { data } = useSession();

  const color = stringToColor(data?.user.email ?? "");

  const cartCount = useCartStore((state) => state.getCartCount());

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
          router.push("/"); // Redirect to home after logout
        },
      },
    });
  };

  const navItems = [
    { href: "/", label: tNav("home") },
    { href: "/products", label: tNav("products") },
    { href: "/about", label: tNav("about") },
    { href: "/contact", label: tNav("contact") },
  ];

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            FragranceHub
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-primary text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {data ? (
            <>
              <Link href="/cart" className="group relative p-2">
                <ShoppingBag className="group-hover:text-primary h-6 w-6 text-gray-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="bg-primary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage />
                      <AvatarFallback
                        className={`rounded-lg`}
                        style={{
                          color: color.textColor,
                          backgroundColor: color.bgColor,
                        }}
                      >
                        {data?.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {data.user.name}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {data.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{tNav("profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>{tNav("orders")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{tNav("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // LOGGED OUT STATE: Login Button
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{tNav("login")}</Link>
            </Button>
          )}

          {/* Shop Now CTA (Always Visible or conditional based on preference) */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:flex"
          >
            <Link href="/products">{tCta("shopNow")}</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
