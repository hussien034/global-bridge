import React from "react";
import { useTranslation, LocalizedContent } from "../i18n";

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useTranslation();

  return <LocalizedContent>{(
    <button
      type="button"
      className={`language-switcher${className ? ` ${className}` : ""}`}
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      aria-label={language === "ar" ? "Switch language to English" : "غيّر اللغة إلى العربية"}
      lang={language === "ar" ? "en" : "ar"}
    >
      {language === "ar" ? "EN" : "AR"}
    </button>
  )}</LocalizedContent>;
}
