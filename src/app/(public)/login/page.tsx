import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/templates/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - FragranceHub",
  description: "Sign in to your FragranceHub account",
};

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight">
            {t("page.auth.loginTitle")}
          </h2>
          <p className="text-muted-foreground mt-2 text-center text-sm">
            {t("page.auth.loginSubtitle")}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
