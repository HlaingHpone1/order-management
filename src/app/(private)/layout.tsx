import type { Metadata } from "next";
import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FragranceHub",
  description: "Discover luxury fragrances and premium perfumes.",
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, headersList] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    headers(),
  ]);

  if (!session) {
    const currentPath = headersList.get("x-pathname") || "/";

    const encodedPath = encodeURIComponent(currentPath);
    redirect(`/login?callbackUrl=${encodedPath}`);
  }

  return <>{children}</>;
}
