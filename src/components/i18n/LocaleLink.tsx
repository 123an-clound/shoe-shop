"use client";

import Link, { type LinkProps } from "next/link";
import type { ComponentProps } from "react";
import { localizedHref, type Locale } from "@/lib/i18n/messages";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";

type Props = LinkProps & Omit<ComponentProps<typeof Link>, keyof LinkProps> & { localeOverride?: Locale };

export function LocaleLink({ href, localeOverride, ...props }: Props) {
  const { locale } = useLocaleContext();
  const targetLocale = localeOverride ?? locale;
  const localized = typeof href === "string" ? localizedHref(href, targetLocale) : {
    ...href,
    pathname: href.pathname ? localizedHref(href.pathname, targetLocale) : href.pathname,
  };

  return <Link href={localized} {...props} />;
}
