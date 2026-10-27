import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ar from "./ar.json";
import en from "./en.json";

export type Language = "ar" | "en";
type Dictionary = typeof ar & { legacyText?: Record<string, string> };

interface I18nContextValue {
  language: Language;
  direction: "rtl" | "ltr";
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const dictionaries: Record<Language, Dictionary> = { ar, en };
const I18nContext = createContext<I18nContextValue | null>(null);

const legacyTextPatterns = Object.entries(en.legacyText ?? {})
  .filter(([pattern]) => pattern.includes("{{"))
  .map(([pattern, translation]) => {
    const placeholders = [...pattern.matchAll(/\{\{(\w+)\}\}/g)];
    const segments = pattern.split(/\{\{\w+\}\}/g);
    const expression = new RegExp(
      `^${segments.map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)")}$`,
    );
    return { expression, placeholders, translation };
  });

function getLegacyText(dictionary: Dictionary, text: string): string | undefined {
  const translations = dictionary.legacyText;
  const exactTranslation = translations?.[text];
  if (exactTranslation) return exactTranslation;
  if (!translations || !/[\u0600-\u06FF]/.test(text)) return undefined;

  for (const { expression, placeholders, translation } of legacyTextPatterns) {
    const match = text.match(expression);
    if (!match) continue;

    return placeholders.reduce(
      (result, placeholder, index) => result.replaceAll(placeholder[0], match[index + 1]),
      translation,
    );
  }

  return undefined;
}

function localizeNode(node: ReactNode, dictionary: Dictionary): ReactNode {
  if (typeof node === "string") {
    const text = node.trim().replace(/\s+/g, " ");
    const translated = getLegacyText(dictionary, text);
    if (!translated) return node;
    const leading = node.match(/^\s*/)?.[0] ?? "";
    const trailing = node.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
  }

  if (Array.isArray(node)) {
    return React.Children.map(node, (child) => localizeNode(child, dictionary));
  }

  if (!React.isValidElement<{ [key: string]: unknown; children?: ReactNode }>(node)) return node;

  const localizedProps: Record<string, unknown> = {};
  for (const attribute of ["aria-label", "alt", "placeholder", "title"]) {
    const value = node.props[attribute];
    if (typeof value === "string") {
      localizedProps[attribute] = localizeNode(value, dictionary);
    }
  }

  if (node.props.children !== undefined) {
    localizedProps.children = localizeNode(node.props.children, dictionary);
  }

  return React.cloneElement(node, localizedProps);
}

export function LocalizedContent({ children }: { children: ReactNode }) {
  const { language } = useTranslation();
  return <>{localizeNode(children, dictionaries[language])}</>;
}

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
        ?? getLegacyText(dictionaries[language], key)
        ?? getTranslation(dictionaries.en, key);
      return Object.entries(values ?? {}).reduce(
        (result, [name, replacement]) => result.replaceAll(`{{${name}}}`, String(replacement)),
        message ?? key,
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
