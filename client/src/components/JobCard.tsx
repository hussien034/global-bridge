import React from "react";
import { Link } from "wouter";
import { useTranslation } from "../i18n";

interface JobCardData {
  id: number;
  slug?: string;
  title: string;
  department?: string;
  employmentType?: string;
  remotePolicy?: string;
  experienceLevel?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  timezoneOverlap?: string | null;
  company?: {
    name?: string;
    country?: string;
    isDemo?: boolean;
    logoUrl?: string | null;
  };
}

interface JobCardProps {
  job: JobCardData;
}

function getArtwork(title: string, department = "") {
  const specialty = `${title} ${department}`.toLowerCase();

  if (/backend|back-end|api|database/.test(specialty)) {
    return { image: "backend", label: "specialtyBackend" };
  }
  if (/devops|sre|cloud|platform|infrastructure/.test(specialty)) {
    return { image: "devops", label: "specialtyCloud" };
  }
  if (/frontend|front-end|ui|ux|web design/.test(specialty)) {
    return { image: "frontend", label: "specialtyFrontend" };
  }
  if (/quality|qa|test automation|testing/.test(specialty)) {
    return { image: "qa", label: "specialtyQuality" };
  }
  if (/data|analytics|machine learning|\bml\b|artificial intelligence|\bai\b/.test(specialty)) {
    return { image: "data", label: "specialtyData" };
  }
  return { image: "software", label: "specialtySoftware" };
}

export default function JobCard({ job }: JobCardProps) {
  const { t } = useTranslation();
  const href = `/jobs/${job.slug || job.id}`;
  const artwork = getArtwork(job.title, job.department);
  const hasSalary = job.salaryMin != null && job.salaryMax != null;
  const experienceLabel = job.experienceLevel === "Junior"
    ? t("jobs.experienceJunior")
    : job.experienceLevel === "Mid-level"
      ? t("jobs.experienceMid")
      : job.experienceLevel === "Senior"
        ? t("jobs.experienceSenior")
        : job.experienceLevel === "Lead / Architect"
          ? t("jobs.experienceLead")
          : job.experienceLevel;

  return (
    <article className="position-card">
      <div className={`position-card-artwork position-card-artwork-${artwork.image}`}>
        <img src={`/images/roles/${artwork.image}.svg`} alt="" loading="lazy" />
        <span className="position-card-specialty">{t(`jobs.${artwork.label}`)}</span>
        {job.company?.isDemo && <span className="position-card-demo">{t("jobs.demoPartner")}</span>}
      </div>

      <div className="position-card-content">
        <div className="position-card-company">
          <div className="position-card-company-info">
            <span className="position-card-company-logo" aria-hidden="true">
              {(job.company?.name || "Global Partner").slice(0, 2).toUpperCase()}
              {job.company?.logoUrl && (
                <img
                  src={job.company.logoUrl}
                  alt=""
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </span>
            <span className="position-card-company-name">{job.company?.name || "Global Partner"}</span>
          </div>
          <span className="position-card-country">{job.company?.country || t("jobs.countryFallback")} · {t("jobs.remote")}</span>
        </div>

        <h3 className="position-card-title">
          <Link href={href}>{job.title}</Link>
        </h3>

        <div className="position-card-meta">
          <span className="position-card-open-status">{t("jobs.applyOpen")}</span>
          <span className="meta-pill">{job.employmentType === "Full-time" || !job.employmentType ? t("jobs.fullTime") : job.employmentType}</span>
          {job.experienceLevel && <span className="meta-pill">{experienceLabel}</span>}
          {hasSalary && (
            <span className="meta-pill position-card-salary">
              {job.salaryCurrency || "EUR"} {job.salaryMin}–{job.salaryMax}
            </span>
          )}
          {job.timezoneOverlap && <span className="meta-pill">⏰ {job.timezoneOverlap}</span>}
          {job.remotePolicy && <span className="meta-pill">{job.remotePolicy}</span>}
        </div>

        <div className="position-card-actions">
          <Link href={`${href}/apply`} className="btn btn-primary">
            {t("jobs.apply")}
          </Link>
          <Link href={href} className="position-card-details">
            {t("jobs.details")} <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
