"use client";

import { usePathname } from "next/navigation";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

export function LanguageSwitch() {
  const pathname = usePathname() ?? "/";
  const { locale, messages } = useLocaleContext();
  const englishPath = pathname.startsWith("/en") ? pathname : `/en${pathname === "/" ? "" : pathname}`;
  const vietnamesePath = pathname.replace(/^\/en(?=\/|$)/, "") || "/";

  return (
    <div className="flex items-center rounded-full border border-ink-700 p-1 text-xs" aria-label={messages.controls.language}>
      <LocaleLink href={vietnamesePath} localeOverride="vi" hrefLang="vi" aria-current={locale === "vi" ? "true" : undefined} className={`rounded-full px-2.5 py-1.5 ${locale === "vi" ? "bg-ink-800 text-fg" : "text-fg-muted hover:text-fg"}`}>
        VI
      </LocaleLink>
      <LocaleLink href={englishPath} localeOverride="en" hrefLang="en" aria-current={locale === "en" ? "true" : undefined} className={`rounded-full px-2.5 py-1.5 ${locale === "en" ? "bg-ink-800 text-fg" : "text-fg-muted hover:text-fg"}`}>
        EN
      </LocaleLink>
    </div>
  );
}
