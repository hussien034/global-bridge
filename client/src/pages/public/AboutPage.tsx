import React from "react";
import { Link } from "wouter";
import { useTranslation } from "../../i18n";

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="pill-badge" style={{ marginBottom: "14px", display: "inline-flex" }}>
          <span>🇪🇬</span>
          <span>{t("about.badge")}</span>
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 14px 0", color: "var(--cairo-ink)" }}>
          {t("about.title")}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "680px", margin: "0 auto", lineHeight: 1.8 }}>
          {t("about.intro")}
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="cards-grid" style={{ marginBottom: "48px" }}>
        <div className="feature-card">
          <div className="card-icon" style={{ fontSize: "32px", marginBottom: "12px" }}>🎯</div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>{t("about.visionTitle")}</h3>
          <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--text-muted)" }}>
            {t("about.vision")}
          </p>
        </div>

        <div className="feature-card">
          <div className="card-icon" style={{ fontSize: "32px", marginBottom: "12px" }}>🛡️</div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>{t("about.transparencyTitle")}</h3>
          <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--text-muted)" }}>
            {t("about.transparency")}
          </p>
        </div>

        <div className="feature-card">
          <div className="card-icon" style={{ fontSize: "32px", marginBottom: "12px" }}>🏛️</div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>{t("about.identityTitle")}</h3>
          <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--text-muted)" }}>
            {t("about.identity")}
          </p>
        </div>
      </div>

      {/* Ethics & Data Policy Banner */}
      <div className="feature-card" style={{ padding: "32px", marginBottom: "48px", borderLeft: "5px solid var(--nile-blue)" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px", color: "var(--cairo-ink)" }}>
          {t("about.privacyTitle")}
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--text-muted)", margin: "0 0 16px 0" }}>
          {t("about.privacy")}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <span className="demo-tag" style={{ background: "color-mix(in srgb, var(--nile-blue) 10%, transparent)", color: "var(--nile-blue)" }}>
            📝 {t("about.privacyTag")}
          </span>
          <span className="demo-tag" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
            🤝 {t("about.companyReviewTag")}
          </span>
          <span className="demo-tag" style={{ background: "rgba(216, 160, 56, 0.15)", color: "var(--egypt-gold-text)" }}>
            ✨ {t("about.optionalTrainingTag")}
          </span>
        </div>
      </div>

      {/* Call to Action */}
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "16px" }}>{t("about.ctaTitle")}</h2>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/jobs" className="btn btn-primary" style={{ padding: "12px 30px", fontSize: "16px" }}>
            {t("about.browseJobs")} 💼
          </Link>
          <Link href="/companies" className="btn btn-outline" style={{ padding: "12px 30px", fontSize: "16px" }}>
            {t("about.forCompanies")} 🚀
          </Link>
        </div>
      </div>
    </div>
  );
}
