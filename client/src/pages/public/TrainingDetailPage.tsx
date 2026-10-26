import React, { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export default function TrainingDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadTraining() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.public.getTraining(id!);
        if (res.success && res.data) {
          setTraining(res.data);
        } else {
          setError(res.error || t("trainingDetail.notFound"));
        }
      } catch (err: any) {
        setError(err.message || t("common.error"));
      } finally {
        setIsLoading(false);
      }
    }
    loadTraining();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-muted)" }}>
        {t("trainingDetail.loading")}
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "#EF4444", fontSize: "18px", marginBottom: "16px" }}>
          ⚠️ {error || t("trainingDetail.notFound")}
        </p>
        <Link href="/training" className="btn btn-primary">
          {t("trainingDetail.backTraining")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Top Card */}
      <div className="feature-card" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Link href="/training" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                {t("nav.training")}
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{training.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "var(--cairo-ink)" }}>
                {training.title}
              </h1>
              <span className="demo-tag" style={{ background: "rgba(216, 160, 56, 0.15)", color: "var(--egypt-gold-text)" }}>
                {t("training.optionalTraining")}
              </span>
              {training.isDemo && <span className="demo-tag">{t("training.demoProgram")}</span>}
            </div>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 0", fontSize: "15px" }}>
              {t("trainingDetail.provider")}: <strong>{training.providerName || t("training.providerUnknown")}</strong> • {t("trainingDetail.duration")}: {training.duration || t("training.durationUnknown")} • {t("trainingDetail.level")}: {training.level || t("training.levelIntermediate")}
            </p>
          </div>

          <div>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: "10px 22px" }}>
              {t("trainingDetail.browseJobs")} 💼
            </Link>
          </div>
        </div>
      </div>

      {/* Mandatory Notice */}
      <div className="mandatory-notice-box" style={{ marginBottom: "28px" }}>
        <div className="notice-icon">ℹ️</div>
        <div>
          <strong>{t("trainingDetail.noticeTitle")}:</strong> {t("trainingDetail.notice")}
        </div>
      </div>

      <div className="job-detail-layout">
        <div className="job-detail-main">
          <section className="detail-section">
            <h3>{t("trainingDetail.outcomes")}</h3>
            <p style={{ lineHeight: 1.8, fontSize: "15px", whiteSpace: "pre-line" }}>
              {training.description}
            </p>
          </section>

          {training.syllabus && (
            <section className="detail-section">
              <h3>{t("trainingDetail.syllabus")}</h3>
              <div style={{ lineHeight: 1.8, fontSize: "15px", whiteSpace: "pre-line" }}>
                {training.syllabus}
              </div>
            </section>
          )}

          {training.prerequisites && (
            <section className="detail-section">
              <h3>{t("trainingDetail.prerequisites")}</h3>
              <div style={{ lineHeight: 1.8, fontSize: "15px", whiteSpace: "pre-line" }}>
                {training.prerequisites}
              </div>
            </section>
          )}
        </div>

        <aside className="job-detail-sidebar">
          <div className="sidebar-meta-card">
            <h4>{t("trainingDetail.detailsCard")}</h4>
            <div className="meta-row"><span>{t("trainingDetail.duration")}:</span> <strong>{training.duration || t("training.durationUnknown")}</strong></div>
            <div className="meta-row"><span>{t("trainingDetail.format")}:</span> <strong>{training.format || t("training.formatUnknown")}</strong></div>
            <div className="meta-row"><span>{t("trainingDetail.level")}:</span> <strong>{training.level || t("training.levelIntermediate")}</strong></div>
            <div className="meta-row"><span>{t("trainingDetail.nature")}:</span> <strong style={{ color: "var(--egypt-gold-text)" }}>{t("trainingDetail.optional")}</strong></div>

            <div style={{ marginTop: "24px" }}>
              <Link href="/jobs" className="btn btn-primary" style={{ width: "100%", textAlign: "center", padding: "12px", fontSize: "14px" }}>
                {t("trainingDetail.browseJobs")} 💼
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
