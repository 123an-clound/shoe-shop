"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { MESSAGES, type Locale, type Messages } from "@/lib/i18n/messages";

const LocaleContext = createContext<{ locale: Locale; messages: Messages }>({ locale: "vi", messages: MESSAGES.vi });

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const value = useContext(LocaleContext);
  return value;
}
