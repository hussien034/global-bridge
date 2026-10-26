import React, { useEffect, useState } from "react";
import JobCard from "../../components/JobCard";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export default function JobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchJobs() {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (selectedDept) params.department = selectedDept;
      if (selectedLevel) params.experienceLevel = selectedLevel;
      const res = await api.public.getJobs(params);
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [selectedDept, selectedLevel]);

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = job.title?.toLowerCase().includes(q);
    const compMatch = job.company?.name?.toLowerCase().includes(q);
    const skillsMatch = Array.isArray(job.skills)
      ? job.skills.some((s: string) => s.toLowerCase().includes(q))
      : String(job.skills || "").toLowerCase().includes(q);
    return titleMatch || compMatch || skillsMatch;
  });

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div className="pill-badge" style={{ marginBottom: "12px", display: "inline-flex" }}>
          <span aria-hidden="true">✦</span>
          <span>{t("jobs.badge")}</span>
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px 0", color: "var(--cairo-ink)" }}>
          {t("jobs.title")}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "650px", margin: "0 auto" }}>
          {t("jobs.intro")}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="feature-card" style={{ marginBottom: "32px", padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <div style={{ gridColumn: "span 2" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("jobs.search")}
              aria-label={t("jobs.search")}
              className="input-field"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-field"
            >
              <option value="">{t("jobs.allDepartments")}</option>
              <option value="Web Application">{t("jobs.frontend")}</option>
              <option value="Backend Infrastructure">{t("jobs.backend")}</option>
              <option value="Quality Engineering">{t("jobs.quality")}</option>
              <option value="Cloud Operations">{t("jobs.cloud")}</option>
            </select>
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input-field"
            >
              <option value="">{t("jobs.allLevels")}</option>
              <option value="Junior">{t("jobs.junior")}</option>
              <option value="Mid-level">{t("jobs.mid")}</option>
              <option value="Senior">{t("jobs.senior")}</option>
              <option value="Lead / Architect">{t("jobs.lead")}</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "24px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)", fontSize: "16px" }}>
          {t("jobs.loading")}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>{t("jobs.empty")}</p>
          <button onClick={() => { setSearchQuery(""); setSelectedDept(""); setSelectedLevel(""); }} className="btn btn-outline" style={{ marginTop: "12px" }}>
            {t("jobs.resetFilters")}
          </button>
        </div>
      ) : (
        <div className="jobs-list-container position-cards-grid">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
