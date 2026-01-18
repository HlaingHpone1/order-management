import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";

const Footer = async () => {
  const t = await getTranslations();

  return (
    <footer className="bg-muted/50 border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {t("footer.brandName")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("footer.brandDescription")}
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">{t("footer.shop")}</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-primary">
                  {t("footer.allProducts")}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=mens-fragrances"
                  className="hover:text-primary"
                >
                  {t("footer.mensFragrances")}
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=womens-fragrances"
                  className="hover:text-primary"
                >
                  {t("footer.womensFragrances")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">
              {t("footer.company")}
            </h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t("navigation.contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">
              {t("footer.support")}
            </h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t("footer.customerService")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  {t("footer.shippingInfo")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {t("footer.brandName")}.{" "}
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
