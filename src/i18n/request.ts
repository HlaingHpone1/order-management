import { getUserLocale } from "@/services/locale";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  const common = (await import(`../../localization/${locale}/common.json`))
    .default;

  const sidebar = (await import(`../../localization/${locale}/sidebar.json`))
    .default;

  const breadcrumb = (
    await import(`../../localization/${locale}/breadcrumb.json`)
  ).default;

  const form = (await import(`../../localization/${locale}/form.json`)).default;

  const page = (await import(`../../localization/${locale}/page.json`)).default;

  const messages = {
    ...common,
    sidebar,
    form,
    page,
    breadcrumb,
  };

  return {
    locale,
    messages: messages,
  };
});
