"use server";

import { auth } from "@/config/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { LoginFormData } from "@/templates/auth/login-form";
import { RegisterFormData } from "@/templates/auth/register-form";

export async function signInAction(body: LoginFormData) {
  try {
    const headersList = await headers();
    const result = await auth.api.signInEmail({
      body,
      headers: headersList,
    });

    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function signUpAction(body: RegisterFormData) {
  try {
    const headersList = await headers();
    const result = await auth.api.signUpEmail({
      body: body,
      headers: headersList,
    });

    revalidatePath("/register");

    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
