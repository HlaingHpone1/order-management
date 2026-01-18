"use server";

import { prisma } from "@/config/auth"; // Your prisma client
import { auth } from "@/config/auth"; // Better Auth instance
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { User, UserRole } from "@/generated/prisma/client";
import { CreateUserInput } from "@/templates/users/create-user-modal";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const updateUserSchema = z.object({
  userId: z.string(),
  role: z.enum(["CUSTOMER", "ADMIN", "MANAGER"]),
});

export async function updateUserRole(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user as User;

  // Security: Only admins can perform this action
  if (user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as UserRole;

  const validation = updateUserSchema.safeParse({ userId, role });

  if (!validation.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User role updated" };
  } catch (error) {
    return { success: false, error: "Failed to update user" };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user as User;

  if (user?.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User deleted" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to delete user. They may have active orders.",
    };
  }
}

export async function createUser(data: CreateUserInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user as User;

  // CHECK: Ensure strict Enum comparison (ADMIN vs Admin)
  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admins only" };
  }

  const { name, email, password, role } = data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: true,
        image: null,
        // FIX 1: Ensure role matches the Enum type
        role: role as UserRole,

        // FIX 2: REMOVED "password: hashedPassword" from here (it's not in User model)

        accounts: {
          create: {
            // FIX 3: Manually generate ID because your schema lacks @default(uuid()) for Account
            id: uuidv4(),
            providerId: "credential",
            accountId: email,
            password: hashedPassword, // Password belongs here

            // Required by your schema (if no defaults):
            accessToken: null,
            refreshToken: null,
            idToken: null,
            scope: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
          },
        },
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User created successfully" };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Failed to create user." };
  }
}
