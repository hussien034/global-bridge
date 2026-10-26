import React from "react";
import { useTranslation } from "../i18n";

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <button
      type="button"
      className={className ?? "language-switcher"}
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      aria-label={language === "ar" ? "Switch language to English" : "غيّر اللغة إلى العربية"}
      lang={language === "ar" ? "en" : "ar"}
    >
      {t("common.language")}
    </button>
  );
}
