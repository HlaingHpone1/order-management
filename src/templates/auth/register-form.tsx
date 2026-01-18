"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/templates/auth/action";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { useRouter } from "next/navigation";

// Schema uses form.validation keys
const registerSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, {
        message: t("form.validation.name_min"),
      }),
      email: z.string().email({
        message: t("form.validation.email_invalid"),
      }),
      password: z.string().min(6, {
        message: t("form.validation.password_min"),
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("form.validation.password_match"),
      path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<ReturnType<typeof registerSchema>>;

export function RegisterForm() {
  const t = useTranslations();

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema(t)),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const result = await signUpAction(data);

      if (result && "error" in result) {
        toast.error(result.error);
        setIsSubmitting(false);
      } else {
        toast.success(t("page.auth.registerSuccess"));
        router.push("/");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("page.auth.registerError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.label.name")}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            placeholder={t("form.placeholder.name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("form.label.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            placeholder={t("form.placeholder.email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">{t("form.label.password")}</Label>
          <PasswordInput
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            placeholder={t("form.placeholder.password")}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-destructive text-sm">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("form.label.confirmPassword")}
          </Label>
          <PasswordInput
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            placeholder={t("form.placeholder.confirmPassword")}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("page.auth.registering")}
          </>
        ) : (
          t("page.auth.registerButton")
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t("page.auth.haveAccount")}{" "}
        </span>
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          {t("page.auth.loginLink")}
        </Link>
      </div>
    </form>
  );
}
