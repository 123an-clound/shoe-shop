import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/messages";

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return new URL(configuredUrl || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000"));
}

export const SITE_URL = getSiteUrl();

export function localizedAlternates(locale: Locale, viPath: string, enPath: string): Metadata["alternates"] {
  return {
    canonical: locale === "en" ? enPath : viPath,
    languages: {
      "vi-VN": viPath,
      "en-US": enPath,
      "x-default": viPath,
    },
  };
}
