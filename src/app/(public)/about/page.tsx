import { Heart, Award, Users, Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "About Us - FragranceHub",
  description: "Learn about FragranceHub and our mission",
};

export default async function AboutPage() {
  const t = await getTranslations();

  return (
    <div className="bg-background min-h-screen">
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-16 md:py-24 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              {t("page.about.title")}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              {t("page.about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12">
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                {t("page.about.storyTitle")}
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>{t("page.about.storyParagraph1")}</p>
                <p>{t("page.about.storyParagraph2")}</p>
                <p>{t("page.about.storyParagraph3")}</p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="mb-8 text-3xl font-bold md:text-4xl">
                {t("page.about.valuesTitle")}
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Award className="text-primary h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {t("page.about.values.qualityTitle")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("page.about.values.qualityDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Heart className="text-primary h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {t("page.about.values.careTitle")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("page.about.values.careDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Users className="text-primary h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {t("page.about.values.expertTitle")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("page.about.values.expertDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Globe className="text-primary h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">
                      {t("page.about.values.globalTitle")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("page.about.values.globalDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-2xl p-8 md:p-12">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                {t("page.about.missionTitle")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("page.about.missionText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            {t("page.about.ctaTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("page.about.ctaSubtitle")}
          </p>
          <a
            href="/products"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors"
          >
            {t("cta.shopNow")}
          </a>
        </div>
      </section>
    </div>
  );
}
