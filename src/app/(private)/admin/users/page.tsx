import { prisma } from "@/config/auth";
import { Prisma } from "@/generated/prisma/client";
import { UsersTable } from "@/templates/users";
import { Suspense } from "react";

// Define the type for the props
type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 1. Pagination Parameters
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  // 4. Parallel Fetching (Data + Count)
  const [totalCount, users] = await Promise.all([
    // A. Count total matching users
    prisma.user.count({ where }),

    // B. Fetch paginated users
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit, // Limit
      skip: skip, // Offset
    }),
  ]);

  // 5. Calculate Total Pages
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage user access and roles.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        {/* Pass the ALREADY filtered users to the table */}
        <UsersTable initialUsers={users} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
