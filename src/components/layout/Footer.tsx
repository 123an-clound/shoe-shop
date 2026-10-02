import { Mail, MapPin, Phone } from "lucide-react";
import type { Settings } from "@/lib/queries/settings";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import type { Locale } from "@/lib/i18n/messages";
import { getMessages } from "@/lib/i18n/messages";

export function Footer({ settings, locale }: { settings: Settings; locale: Locale }) {
  const year = new Date().getFullYear();
  const messages = getMessages(locale);
  const navLinks = [
    { href: "/san-pham", label: messages.nav.products },
    { href: "/ve-chung-toi", label: messages.nav.about },
    { href: "/lien-he", label: messages.nav.contact },
  ];

  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-xl font-bold text-fg">
            {settings.store_name}
          </p>
          <p className="mt-3 max-w-xs text-sm text-fg-muted">
            {(locale === "en" ? settings.slogan_en : settings.slogan) || settings.slogan}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center rounded-full px-3 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
              >
                Facebook
              </a>
            )}
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center rounded-full px-3 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
              >
                Instagram
              </a>
            )}
            {settings.zalo_url && (
              <a
                href={settings.zalo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 items-center justify-center rounded-full px-3 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
              >
                Zalo
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-fg">{messages.footer.direction}</p>
          <ul className="mt-4 flex flex-col gap-3">
            {navLinks.map((item) => (
              <li key={item.href}>
                <LocaleLink
                  href={item.href}
                  className="text-sm text-fg-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-fg">{messages.footer.contact}</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-fg-muted">
            {settings.phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`tel:${settings.phone}`} className="hover:text-fg">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="hover:text-fg">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-700 px-4 py-6 text-center text-xs text-fg-muted sm:px-6 lg:px-8">
        © {year} {settings.store_name}. {messages.footer.cod}
      </div>
    </footer>
  );
}
