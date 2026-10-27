import React, { useEffect, useState } from "react";
import { useTranslation, LocalizedContent } from "../i18n";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark">(() => (
    localStorage.getItem("gb-theme") === "light" ? "light" : "dark"
  ));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("gb-theme", next);
  };

  return <LocalizedContent>{(
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle${className ? ` ${className}` : ""}`}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={t(theme === "light" ? "common.switchToDarkMode" : "common.switchToLightMode")}
      title={t(theme === "light" ? "common.switchToDarkMode" : "common.switchToLightMode")}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-sun">☀</span>
        <span className="theme-toggle-icon theme-toggle-moon">☾</span>
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  )}</LocalizedContent>;
}
