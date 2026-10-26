import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import JobCard from "../../components/JobCard";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const jobsRes = await api.public.getJobs({ limit: 3 }).catch(() => ({ success: false, data: [] }));
        if (jobsRes && jobsRes.data) setFeaturedJobs(jobsRes.data);
      } catch {
        // non-blocking
      }
    }
    loadHomeData();
  }, []);

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
            <p className="heritage-intro">
              {t("home.intro")}
            </p>

            <div className="btn-group heritage-actions">
              <Link href="/jobs" className="btn heritage-btn heritage-btn-primary">
                {t("home.browseJobs")}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/companies" className="btn heritage-btn heritage-btn-accent">
                {t("home.hireTalent")}
              </Link>
            </div>

            <ul className="heritage-trust-list" aria-label={t("home.trustLabel")}>
              <li>{t("home.trust1")}</li>
              <li>{t("home.trust2")}</li>
              <li>{t("home.trust3")}</li>
            </ul>
          </div>

          <div className="heritage-visual">
            <img
              className="heritage-visual-image"
              src="/images/giza-pyramids.jpg"
              alt={t("home.imageAlt")}
            />
            <div className="heritage-arch-mark" aria-hidden="true" />
            <div className="heritage-visual-status">
              <span className="heritage-status-dot" aria-hidden="true" />
              <span>{t("home.ready")}</span>
            </div>
            <div className="heritage-visual-talent">
              <span className="heritage-talent-mark">EG</span>
              <span>{t("home.talent")}</span>
            </div>
            <div className="heritage-visual-caption">
              <span className="heritage-coordinates">29.9792° N, 31.1342° E</span>
              <strong>{t("home.location")}</strong>
              <span>{t("home.caption")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="container featured-jobs-section">
          <div className="featured-jobs-heading">
            <div>
              <h2>
                {t("home.featuredTitle")}
              </h2>
              <p>
                {t("home.featuredDescription")}
              </p>
            </div>
            <Link href="/jobs" className="table-action-link">
              {t("home.allJobs")} ←
            </Link>
          </div>

          <div className="jobs-list-container position-cards-grid">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* How it Works Section */}
      <section className="container" style={{ margin: "40px auto 60px" }}>
        <h2 className="section-heading-centered">{t("home.howTitle")}</h2>
        <p className="section-sub-centered">{t("home.howIntro")}</p>

        <div className="cards-grid">
          <div className="feature-card">
            <div className="card-step-badge">1</div>
            <h3>{t("home.step1Title")}</h3>
            <p>{t("home.step1Description")}</p>
          </div>

          <div className="feature-card">
            <div className="card-step-badge" style={{ background: "var(--egypt-gold)", color: "#102840" }}>2</div>
            <h3>{t("home.step2Title")}</h3>
            <p>{t("home.step2Description")}</p>
          </div>

          <div className="feature-card">
            <div className="card-step-badge">3</div>
            <h3>{t("home.step3Title")}</h3>
            <p>{t("home.step3Description")}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
