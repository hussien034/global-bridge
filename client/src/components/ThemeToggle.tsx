import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("gb-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("gb-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="btn btn-outline"
      style={{ padding: "8px 14px", fontSize: "13px", borderRadius: "999px" }}
      title={theme === "light" ? "التبديل إلى الوضع الداكن" : "التبديل إلى الوضع الفاتح"}
    >
      {theme === "light" ? "🌙 الداكن" : "☀️ الفاتح"}
    </button>
  );
}
