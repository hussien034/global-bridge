import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import JobCard from "../../components/JobCard";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

interface FeaturedJob {
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

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const jobsRes = await api.public.getJobs({ limit: 3 });
        if (jobsRes.success && jobsRes.data) setFeaturedJobs(jobsRes.data);
      } catch {
        setFeaturedJobs([]);
      }
    }

    loadHomeData();
  }, []);

  const trustPoints = ["trust1", "trust2", "trust3", "trust4"];
  const candidatePoints = ["candidatePoint1", "candidatePoint2", "candidatePoint3"];
  const companyPoints = ["companyPoint1", "companyPoint2", "companyPoint3"];
  const benefits = ["benefit1", "benefit2", "benefit3", "benefit4"];

  return (
    <div className="home-page home-heritage">
      <section className="hero heritage-hero">
        <div className="container heritage-hero-content">
          <div className="heritage-copy">
            <div className="heritage-badge">
              <span className="heritage-badge-mark" aria-hidden="true">✦</span>
              <span>{t("home.badge")}</span>
              <span className="heritage-badge-country">EG</span>
            </div>

            <h1>
              {t("home.title")}
              <span className="heritage-title-accent">{t("home.titleAccent")}</span>
            </h1>
            <p className="heritage-intro">{t("home.intro")}</p>

            <div className="btn-group heritage-actions">
              <Link href="/jobs" className="btn heritage-btn heritage-btn-primary">
                {t("home.browseJobs")}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/companies" className="btn heritage-btn heritage-btn-accent">
                {t("home.hireTalent")}
              </Link>
            </div>
          </div>

          <div className="heritage-visual">
            <img
              className="heritage-visual-image"
              src="/images/tech-team-hero.jpg"
              alt={t("home.imageAlt")}
            />
          </div>
        </div>
      </section>

      <section className="container home-trust-strip" aria-label={t("home.trustLabel")}>
        {trustPoints.map((point) => (
          <div className="home-trust-item" key={point}>
            <span className="home-trust-marker" aria-hidden="true">✓</span>
            <span>{t(`home.${point}`)}</span>
          </div>
        ))}
      </section>

      <section className="container home-audiences" aria-labelledby="home-audience-title">
        <div className="home-section-heading">
          <span className="home-section-eyebrow">{t("home.audienceEyebrow")}</span>
          <h2 id="home-audience-title">{t("home.audienceTitle")}</h2>
        </div>
        <div className="home-audience-grid">
          <article className="home-audience-card home-audience-candidates">
            <span className="home-audience-kicker">{t("home.candidateKicker")}</span>
            <h3>{t("home.candidateTitle")}</h3>
            <ul>
              {candidatePoints.map((point) => <li key={point}>{t(`home.${point}`)}</li>)}
            </ul>
            <Link href="/jobs" className="btn btn-primary">{t("home.candidateCta")}</Link>
          </article>
          <article className="home-audience-card home-audience-companies">
            <span className="home-audience-kicker">{t("home.companyKicker")}</span>
            <h3>{t("home.companyTitle")}</h3>
            <ul>
              {companyPoints.map((point) => <li key={point}>{t(`home.${point}`)}</li>)}
            </ul>
            <Link href="/companies" className="btn btn-outline">{t("home.companyCta")}</Link>
          </article>
        </div>
      </section>

      {featuredJobs.length > 0 && (
        <section className="container featured-jobs-section home-featured-jobs">
          <div className="featured-jobs-heading">
            <div>
              <span className="home-section-eyebrow">{t("home.jobsEyebrow")}</span>
              <h2>{t("home.featuredTitle")}</h2>
              <p>{t("home.featuredDescription")}</p>
            </div>
            <Link href="/jobs" className="table-action-link">{t("home.allJobs")} <span aria-hidden="true">←</span></Link>
          </div>
          <div className="jobs-list-container position-cards-grid">
            {featuredJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      )}

      <section className="container home-how-section" aria-labelledby="home-how-title">
        <div className="home-section-heading">
          <span className="home-section-eyebrow">{t("home.howEyebrow")}</span>
          <h2 id="home-how-title">{t("home.howTitle")}</h2>
          <p>{t("home.howIntro")}</p>
        </div>
        <ol className="home-steps">
          {[1, 2, 3].map((step) => (
            <li className="home-step" key={step}>
              <span className="home-step-number">{step}</span>
              <h3>{t(`home.step${step}Title`)}</h3>
              <p>{t(`home.step${step}Description`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container home-benefits-section" aria-labelledby="home-benefits-title">
        <div className="home-section-heading">
          <span className="home-section-eyebrow">{t("home.benefitsEyebrow")}</span>
          <h2 id="home-benefits-title">{t("home.benefitsTitle")}</h2>
        </div>
        <ul className="home-benefits-grid">
          {benefits.map((benefit, index) => (
            <li className="home-benefit-card" key={benefit}>
              <span className="home-benefit-icon" aria-hidden="true">{["✓", "▦", "عA", "i"][index]}</span>
              <span>{t(`home.${benefit}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container home-final-cta">
        <div>
          <span>{t("home.finalEyebrow")}</span>
          <h2>{t("home.finalTitle")}</h2>
          <p>{t("home.finalDescription")}</p>
        </div>
        <div className="home-final-actions">
          <Link href="/jobs" className="btn home-final-primary">{t("home.browseJobs")}</Link>
          <Link href="/companies" className="btn home-final-secondary">{t("home.hireTalent")}</Link>
        </div>
      </section>
    </div>
  );
}
