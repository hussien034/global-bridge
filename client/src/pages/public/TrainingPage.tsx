import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export default function TrainingPage() {
  const { t } = useTranslation();
  const [trainings, setTrainings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrainings() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.public.getTrainings();
        if (res.success && res.data) {
          setTrainings(res.data);
        }
      } catch (err: any) {
        setError(err.message || t("common.error"));
      } finally {
        setIsLoading(false);
      }
    }
    loadTrainings();
  }, []);

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div className="pill-badge" style={{ marginBottom: "14px", display: "inline-flex" }}>
          <span aria-hidden="true">🎓</span>
          <span>{t("training.badge")}</span>
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 14px 0", color: "var(--cairo-ink)" }}>
          {t("training.title")}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "680px", margin: "0 auto", lineHeight: 1.8 }}>
          {t("training.intro")}
        </p>
      </div>

      {/* Mandatory Clarification Notice */}
      <div className="mandatory-notice-box" style={{ maxWidth: "860px", margin: "0 auto 36px" }}>
        <div className="notice-icon">ℹ️</div>
        <div>
          <strong>{t("training.noticeTitle")}:</strong> {t("training.notice")}
        </div>
      </div>

      {error && (
        <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "24px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          {t("training.loading")}
        </div>
      ) : trainings.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "16px" }}>{t("training.empty")}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {trainings.map((program) => (
            <div key={program.id} className="feature-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span className="demo-tag" style={{ background: "rgba(216, 160, 56, 0.15)", color: "var(--egypt-gold-text)" }}>
                    {t("training.optionalTraining")}
                  </span>
                  {program.isDemo && <span className="demo-tag">{t("training.demoProgram")}</span>}
                </div>
                <h3 style={{ fontSize: "20px", marginBottom: "8px", color: "var(--cairo-ink)" }}>{program.title}</h3>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  {program.providerName || t("training.providerUnknown")} • {program.level || t("training.levelIntermediate")}
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--text-muted)", marginBottom: "20px" }}>
                  {program.description}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--border-color, #E2E8F0)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="meta-pill">{program.duration || t("training.durationUnknown")} • {program.deliveryMode || t("training.formatUnknown")}</span>
                <Link href={`/training/${program.slug || program.id}`} className="btn btn-outline" style={{ fontSize: "13px", padding: "6px 14px" }}>
                  {t("training.details")} 🔍
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
