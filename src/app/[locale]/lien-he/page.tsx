import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import type { Locale } from "@/lib/i18n/messages";
import { localizedAlternates } from "@/lib/seo";
import { getMessages } from "@/lib/i18n/messages";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const settings = await getSettings();
  const { locale } = await params;
  return {
    title: locale === "en" ? "Contact" : "Liên hệ",
    description: locale === "en" ? `Contact ${settings.store_name}.` : `Thông tin liên hệ ${settings.store_name}.`,
    alternates: localizedAlternates(locale, "/lien-he", "/en/lien-he"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = getMessages(locale).contact;
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold text-fg sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 text-fg-muted">
          {locale === "en" ? "Questions about products, an order, or working with us? Send us a message." : "Có câu hỏi về sản phẩm, đơn hàng hay hợp tác? Gửi cho chúng tôi bên dưới."}
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-8">
          <ul className="flex flex-col gap-4 text-fg-muted">
            {settings.phone && (
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <a href={`tel:${settings.phone}`} className="hover:text-fg">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="hover:text-fg">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>

          {settings.address && (
            <div className="aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-ink-700">
              <iframe
                title={copy.map}
                src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
                loading="lazy"
                className="h-full w-full"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="glass rounded-[var(--radius-card)] p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-fg">{copy.form}</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
