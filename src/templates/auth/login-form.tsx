"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "@/config/auth-client";

const loginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email().nonempty(t("form.validation.email")),
    password: z.string().nonempty(t("form.validation.password")),
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

export function LoginForm() {
  const router = useRouter();

  const t = useTranslations();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema(t)),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: false,
        fetchOptions: {
          onSuccess: (ctx) => {
            toast.success(t("page.auth.loginSuccess"));
            if (ctx.data.user.role === "ADMIN") {
              router.push("/admin/dashboard");
            } else {
              router.push("/");
            }
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsSubmitting(false);
          },
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("page.auth.loginError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="password">{t("form.label.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            {t("page.auth.forgotPassword")}
          </Link>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("page.auth.loggingIn")}
          </>
        ) : (
          t("page.auth.loginButton")
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t("page.auth.noAccount")}{" "}
        </span>
        <Link
          href="/register"
          className="text-primary font-medium hover:underline"
        >
          {t("page.auth.registerLink")}
        </Link>
      </div>
    </form>
  );
}
