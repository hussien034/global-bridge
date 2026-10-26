import React from "react";
import { Link } from "wouter";
import { useTranslation } from "../i18n";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="container" style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: "72px", fontWeight: 900, color: "var(--nile-blue)", lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: "28px", margin: "16px 0 12px" }}>{t("notFound.title")}</h1>
      <p style={{ color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 30px" }}>
        {t("notFound.description")}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <Link href="/" className="btn btn-primary">
          {t("notFound.home")}
        </Link>
        <Link href="/jobs" className="btn btn-outline">
          {t("notFound.jobs")}
        </Link>
      </div>
    </div>
  );
}
