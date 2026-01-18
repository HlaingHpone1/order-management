"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(t("page.contact.successMessage"));
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-16 md:py-24 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              {t("page.contact.title")}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              {t("page.contact.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold">
                  {t("page.contact.contactInfoTitle")}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t("page.contact.contactInfoDescription")}
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Mail className="text-primary h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">
                        {t("page.contact.emailLabel")}
                      </h3>
                      <p className="text-muted-foreground">
                        <a
                          href="mailto:support@fragrancehub.com"
                          className="hover:text-primary"
                        >
                          support@fragrancehub.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Phone className="text-primary h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">
                        {t("page.contact.phoneLabel")}
                      </h3>
                      <p className="text-muted-foreground">
                        <a
                          href="tel:+1234567890"
                          className="hover:text-primary"
                        >
                          +1 (234) 567-890
                        </a>
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Mon-Fri: 9:00 AM - 6:00 PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-primary/10 rounded-full p-3">
                        <MapPin className="text-primary h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">
                        {t("page.contact.addressLabel")}
                      </h3>
                      <p className="text-muted-foreground">
                        123 Fragrance Street
                        <br />
                        New York, NY 10001
                        <br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 mt-8 rounded-lg border p-6">
                  <h3 className="mb-2 font-semibold">
                    {t("page.contact.businessHoursTitle")}
                  </h3>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>{t("page.contact.businessHoursWeekdays")}</li>
                    <li>{t("page.contact.businessHoursSaturday")}</li>
                    <li>{t("page.contact.businessHoursSunday")}</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="mb-6 text-3xl font-bold">
                  {t("page.contact.formTitle")}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t("page.contact.formNameLabel")}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder={t("page.contact.formNamePlaceholder")}
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("page.contact.formEmailLabel")}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("page.contact.formEmailPlaceholder")}
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {t("page.contact.formSubjectLabel")}
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder={t("page.contact.formSubjectPlaceholder")}
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {t("page.contact.formMessageLabel")}
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      placeholder={t("page.contact.formMessagePlaceholder")}
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      t("page.contact.formSubmitting")
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t("page.contact.formSubmit")}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-center text-3xl font-bold">
              {t("page.contact.faqTitle")}
            </h2>
            <div className="space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-2 font-semibold">
                  {t("page.contact.faq.trackOrderQuestion")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("page.contact.faq.trackOrderAnswer")}
                </p>
              </div>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-2 font-semibold">
                  {t("page.contact.faq.returnPolicyQuestion")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("page.contact.faq.returnPolicyAnswer")}
                </p>
              </div>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-2 font-semibold">
                  {t("page.contact.faq.authenticityQuestion")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("page.contact.faq.authenticityAnswer")}
                </p>
              </div>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-2 font-semibold">
                  {t("page.contact.faq.internationalShippingQuestion")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("page.contact.faq.internationalShippingAnswer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
