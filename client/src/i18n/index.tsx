import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ar from "./ar.json";
import en from "./en.json";

export type Language = "ar" | "en";
type Dictionary = typeof ar;

interface I18nContextValue {
  language: Language;
  direction: "rtl" | "ltr";
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, Dictionary> = { ar, en };
const I18nContext = createContext<I18nContextValue | null>(null);

function getTranslation(dictionary: Dictionary, key: string): string | undefined {
  let value: unknown = dictionary;
  for (const part of key.split(".")) {
    if (typeof value !== "object" || value === null || !(part in value)) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === "string" ? value : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("gb_language");
    return saved === "en" ? "en" : "ar";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = getTranslation(dictionaries[language], "site.title") ?? "Global Bridge";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = getTranslation(dictionaries[language], "site.description") ?? "";
    }
    localStorage.setItem("gb_language", language);
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    direction: language === "ar" ? "rtl" : "ltr",
    setLanguage,
    t: (key, values) => {
      const message = getTranslation(dictionaries[language], key)
        ?? getTranslation(dictionaries.en, key);
      if (!message) return key;
      return Object.entries(values ?? {}).reduce(
        (result, [name, replacement]) => result.replaceAll(`{{${name}}}`, String(replacement)),
        message,
      );
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within I18nProvider.");
  return context;
}
