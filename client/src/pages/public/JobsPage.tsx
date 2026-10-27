import React, { useEffect, useState } from "react";
import JobCard from "../../components/JobCard";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

const PAGE_SIZE = 12;

const departmentOptions = [
  ["Web Application", "jobs.departments.web"],
  ["Backend Infrastructure", "jobs.departments.backend"],
  ["Quality Engineering", "jobs.departments.quality"],
  ["Cloud Operations", "jobs.departments.cloud"],
  ["Data & Analytics", "jobs.departments.data"],
  ["Mobile Applications", "jobs.departments.mobile"],
  ["AI & Machine Learning", "jobs.departments.ai"],
  ["Cybersecurity", "jobs.departments.security"],
  ["Product Design", "jobs.departments.design"],
  ["Product Management", "jobs.departments.product"],
  ["Business Analysis", "jobs.departments.business"],
  ["Technical Support", "jobs.departments.support"],
  ["Customer Success", "jobs.departments.customerSuccess"],
  ["Technical Writing", "jobs.departments.writing"],
  ["Project Management", "jobs.departments.project"],
  ["IT Support", "jobs.departments.it"],
  ["Database Engineering", "jobs.departments.database"],
  ["Solutions Architecture", "jobs.departments.architecture"],
  ["Software Engineering", "jobs.departments.software"],
] as const;

export default function JobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function fetchJobs() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.public.getJobs({
          department: selectedDept || undefined,
          experienceLevel: selectedLevel || undefined,
          search: searchQuery || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });

        if (!res.success || !res.data) {
          throw new Error(res.error || t("common.error"));
        }

        if (active) {
          setJobs(res.data);
          setTotalJobs(res.pagination?.total ?? res.count ?? res.data.length);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : t("common.error"));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchJobs();
    return () => { active = false; };
  }, [selectedDept, selectedLevel, searchQuery, page, t]);

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);
  const rangeStart = totalJobs === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalJobs);
  const pageWindowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.max(0, Math.min(totalPages, 5)) },
    (_, index) => pageWindowStart + index,
  );

  function resetFilters() {
    setSearchInput("");
    setSearchQuery("");
    setSelectedDept("");
    setSelectedLevel("");
    setPage(1);
  }

  return (
    <div className="container jobs-page" style={{ padding: "40px 24px" }}>
      <div className="jobs-page-heading">
        <div className="pill-badge">
          <span aria-hidden="true">✦</span>
          <span>{t("jobs.badge")}</span>
        </div>
        <h1>{t("jobs.title")}</h1>
        <p>{t("jobs.intro")}</p>
      </div>

      <div className="feature-card jobs-filter-card">
        <div className="jobs-filter-grid">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("jobs.search")}
            aria-label={t("jobs.search")}
            className="input-field jobs-search-field"
          />
          <select
            value={selectedDept}
            onChange={(event) => { setSelectedDept(event.target.value); setPage(1); }}
            className="input-field"
            aria-label={t("jobs.allDepartments")}
          >
            <option value="">{t("jobs.allDepartments")}</option>
            {departmentOptions.map(([value, label]) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(event) => { setSelectedLevel(event.target.value); setPage(1); }}
            className="input-field"
            aria-label={t("jobs.allLevels")}
          >
            <option value="">{t("jobs.allLevels")}</option>
            <option value="Junior">{t("jobs.junior")}</option>
            <option value="Mid-level">{t("jobs.mid")}</option>
            <option value="Senior">{t("jobs.senior")}</option>
            <option value="Lead / Architect">{t("jobs.lead")}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="jobs-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {isLoading ? (
        <div className="jobs-status-message" role="status">{t("jobs.loading")}</div>
      ) : jobs.length === 0 ? (
        <div className="jobs-status-message">
          <p>{t("jobs.empty")}</p>
          <button type="button" onClick={resetFilters} className="btn btn-outline">
            {t("jobs.resetFilters")}
          </button>
        </div>
      ) : (
        <>
          <div className="jobs-results-summary" aria-live="polite">
            {t("jobs.showing", { start: rangeStart, end: rangeEnd, total: totalJobs })}
          </div>
          <div className="jobs-list-container position-cards-grid">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
          {totalPages > 1 && (
            <nav className="jobs-pagination" aria-label={t("jobs.pagination")}>
              <button
                type="button"
                className="jobs-page-button jobs-page-direction"
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 1 || isLoading}
              >
                {t("jobs.previousPage")}
              </button>
              {pageWindowStart > 1 && (
                <>
                  <button type="button" className="jobs-page-button" onClick={() => setPage(1)}>1</button>
                  {pageWindowStart > 2 && <span className="jobs-page-ellipsis" aria-hidden="true">…</span>}
                </>
              )}
              {visiblePages.map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`jobs-page-button${pageNumber === page ? " is-active" : ""}`}
                  onClick={() => setPage(pageNumber)}
                  aria-current={pageNumber === page ? "page" : undefined}
                  aria-label={t("jobs.pageNumber", { page: pageNumber })}
                  disabled={isLoading}
                >
                  {pageNumber}
                </button>
              ))}
              {pageWindowStart + visiblePages.length - 1 < totalPages && (
                <>
                  {pageWindowStart + visiblePages.length < totalPages && (
                    <span className="jobs-page-ellipsis" aria-hidden="true">…</span>
                  )}
                  <button
                    type="button"
                    className="jobs-page-button"
                    onClick={() => setPage(totalPages)}
                    disabled={isLoading}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                type="button"
                className="jobs-page-button jobs-page-direction"
                onClick={() => setPage((current) => current + 1)}
                disabled={page === totalPages || isLoading}
              >
                {t("jobs.nextPage")}
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
