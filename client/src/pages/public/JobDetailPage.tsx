import React, { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export default function JobDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadJob() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.public.getJob(id!);
        if (res.success && res.data) {
          setJob(res.data);
        } else {
          setError(res.error || t("jobDetail.notFound"));
        }
      } catch (err: any) {
        setError(err.message || t("common.error"));
      } finally {
        setIsLoading(false);
      }
    }

    loadJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-muted)" }}>
        {t("jobDetail.loading")}
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "#EF4444", fontSize: "18px", marginBottom: "16px" }}>
          ⚠️ {error || t("jobDetail.notFound")}
        </p>
        <Link href="/jobs" className="btn btn-primary">
          {t("jobDetail.backJobs")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Top Header Card */}
      <div className="feature-card" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Link href="/jobs" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                {t("nav.jobs")}
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{job.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: "var(--cairo-ink)" }}>
                {job.title}
              </h1>
              {job.company?.isDemo && <span className="demo-tag">Demo Partner</span>}
              <span className="status-pill status-active">{t("jobDetail.available")}</span>
            </div>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 0", fontSize: "16px" }}>
              {t("jobDetail.company")} <strong>{job.company?.name}</strong> • {t("jobDetail.headquarters")}: {job.company?.country} 🌍 • {t("jobDetail.workPolicy")}: {job.remotePolicy || t("jobDetail.remoteFromEgypt")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href={`/jobs/${job.slug || job.id}/apply`} className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "16px" }}>
              {t("jobDetail.applyNow")} 🚀
            </Link>
          </div>
        </div>
      </div>

      <div className="job-detail-layout">
        <div className="job-detail-main">
          {/* Company Bio */}
          <section className="detail-section">
            <h3>{t("jobDetail.companyAbout")}</h3>
            <p style={{ lineHeight: 1.8, fontSize: "15px", color: "var(--text-muted)" }}>
              {job.company?.description || t("jobDetail.companyInfoUnavailable")}
            </p>
            {job.company?.website && (
              <div style={{ marginTop: "10px" }}>
                <a href={job.company.website} target="_blank" rel="noreferrer" style={{ color: "var(--nile-blue)", fontSize: "14px" }}>
                  {t("jobDetail.visitWebsite")} ↗
                </a>
              </div>
            )}
          </section>

          {/* Description */}
          <section className="detail-section">
            <h3>{t("jobDetail.description")}</h3>
            <p style={{ lineHeight: 1.8, fontSize: "15px", whiteSpace: "pre-line" }}>
              {job.description}
            </p>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && (
            <section className="detail-section">
              <h3>{t("jobDetail.responsibilities")}</h3>
              <div style={{ lineHeight: 1.8, fontSize: "15px", whiteSpace: "pre-line" }}>
                {job.responsibilities}
              </div>
            </section>
          )}

          {/* Requirements */}
          {job.requirements && (
            <section className="detail-section">
              <h3>{t("jobDetail.requirements")}</h3>
              <div style={{ lineHeight: 1.8, fontSize: "15px", whiteSpace: "pre-line" }}>
                {job.requirements}
              </div>
            </section>
          )}

          {/* Skills Badges */}
          <section className="detail-section">
            <h3>{t("jobDetail.skills")}</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
              {(Array.isArray(job.skills) ? job.skills : String(job.skills || "").split(",")).map((sk: string, idx: number) => (
                <span key={idx} className="meta-pill" style={{ background: "color-mix(in srgb, var(--nile-blue) 8%, transparent)", color: "var(--nile-blue)", fontWeight: 600 }}>
                  {sk.trim()}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="job-detail-sidebar">
          <div className="sidebar-meta-card">
            <h4>{t("jobDetail.detailsCard")}</h4>
            <div className="meta-row"><span>{t("jobDetail.employmentType")}:</span> <strong>{job.employmentType === "Full-time" || !job.employmentType ? t("jobDetail.fullTime") : job.employmentType}</strong></div>
            <div className="meta-row"><span>{t("jobDetail.experience")}:</span> <strong>{job.experienceLevel === "Junior" ? t("jobs.experienceJunior") : job.experienceLevel === "Mid-level" ? t("jobs.experienceMid") : job.experienceLevel === "Senior" ? t("jobs.experienceSenior") : job.experienceLevel === "Lead / Architect" ? t("jobs.experienceLead") : job.experienceLevel}</strong></div>
            <div className="meta-row"><span>{t("jobDetail.department")}:</span> <strong>{job.department}</strong></div>
            {job.salaryMin && job.salaryMax && (
              <div className="meta-row">
                <span>{t("jobDetail.monthlySalary")}:</span>
                <strong style={{ color: "var(--nile-blue)" }}>
                  {job.salaryMin} - {job.salaryMax} {job.salaryCurrency || "EUR"}
                </strong>
              </div>
            )}
            {job.timezoneOverlap && (
              <div className="meta-row">
                <span>{t("jobDetail.timezone")}:</span>
                <strong>{job.timezoneOverlap}</strong>
              </div>
            )}
            <div className="meta-row"><span>{t("jobDetail.location")}:</span> <strong>{t("jobDetail.workFromEgypt")}</strong></div>
            <div className="meta-row"><span>{t("jobDetail.applicationFee")}:</span> <strong style={{ color: "#10B981" }}>{t("jobDetail.free")}</strong></div>

            <div style={{ marginTop: "24px" }}>
              <Link href={`/jobs/${job.slug || job.id}/apply`} className="btn btn-primary" style={{ width: "100%", padding: "12px", textAlign: "center", fontSize: "15px" }}>
                {t("jobDetail.applyNow")} 🚀
              </Link>
            </div>
            <div style={{ marginTop: "12px" }}>
              <Link href="/jobs" className="btn btn-outline" style={{ width: "100%", textAlign: "center", fontSize: "14px" }}>
                {t("jobDetail.otherJobs")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
