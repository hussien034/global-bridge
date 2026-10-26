import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  newApplicants: number;
  interviewCount: number;
  offerCount: number;
  hiredCount: number;
}

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const [statsRes, jobsRes, appsRes] = await Promise.all([
          api.company.getDashboard().catch(() => ({ success: false, data: null })),
          api.company.getJobs().catch(() => ({ success: false, data: [] })),
          api.company.getApplicants().catch(() => ({ success: false, data: [] })),
        ]);

        if (isMounted) {
          if (statsRes && statsRes.data) {
            setStats(statsRes.data);
          }
          if (jobsRes && jobsRes.data) {
            setRecentJobs(jobsRes.data.slice(0, 4));
          }
          if (appsRes && appsRes.data) {
            setRecentApplicants(appsRes.data.slice(0, 4));
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "تعذّر تحميل بيانات لوحة التحكم.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    {
      label: "الوظائف النشطة",
      value: stats ? stats.activeJobs.toString() : "—",
      icon: "💼",
      badge: stats ? `${stats.totalJobs} إجمالي` : "...",
      color: "var(--nile-blue)",
    },
    {
      label: "إجمالي المتقدمين",
      value: stats ? stats.totalApplicants.toString() : "—",
      icon: "👥",
      badge: stats ? `${stats.newApplicants} جديد` : "...",
      color: "#10B981",
    },
    {
      label: "المقابلات الجارية",
      value: stats ? stats.interviewCount.toString() : "—",
      icon: "📅",
      badge: "Interview Stage",
      color: "var(--egypt-gold)",
    },
    {
      label: "العروض والتعيينات",
      value: stats ? (stats.offerCount + stats.hiredCount).toString() : "—",
      icon: "🎉",
      badge: stats ? `${stats.hiredCount} تم التعيين` : "...",
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      {/* Top Header Card */}
      <div className="feature-card" style={{ marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="demo-tag" style={{ background: "color-mix(in srgb, var(--nile-blue) 10%, transparent)", color: "var(--nile-blue)" }}>
                {user?.companyName || user?.name || "Company Workspace"}
              </span>
              {user?.isDemo && <span className="status-pill status-active">Demo Partner</span>}
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0" }}>
              لوحة تحكم الشركة ومتابعة التوظيف
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "15px" }}>
              متابعة الوظائف المنشورة ومراجعة طلبات المرشحين وتحديث مراحلها
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/company/jobs/new" className="btn btn-primary" style={{ padding: "10px 20px" }}>
              + نشر وظيفة جديدة 🚀
            </Link>
            <Link href="/company/applicants" className="btn btn-outline" style={{ padding: "10px 20px" }}>
              استعراض المتقدمين (ATS)
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "24px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="stats-cards-grid">
        {statCards.map((s, idx) => (
          <div key={idx} className="stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
            <div className="stat-header">
              <span className="stat-icon" style={{ fontSize: "24px" }}>{s.icon}</span>
              <span className="stat-badge">{s.badge}</span>
            </div>
            <div className="stat-value" style={{ fontSize: "32px", fontWeight: 800, margin: "8px 0 4px" }}>
              {isLoading ? "..." : s.value}
            </div>
            <div className="stat-label" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Navigation / Recent Data Grid */}
      <div className="dashboard-grid-two-col" style={{ marginTop: "32px" }}>
        {/* Recent Jobs */}
        <div className="feature-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>أحدث الوظائف المعلنة</h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>فرص العمل التابعة لشركتك</span>
            </div>
            <Link href="/company/jobs" className="table-action-link" style={{ fontSize: "14px" }}>
              عرض كل الوظائف ({recentJobs.length}) ←
            </Link>
          </div>

          {isLoading ? (
            <p style={{ color: "var(--text-muted)" }}>جاري تحميل الوظائف...</p>
          ) : recentJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
              <p>لم تنشر أي وظيفة بعد.</p>
              <Link href="/company/jobs/new" className="btn btn-primary" style={{ fontSize: "13px" }}>
                نشر أول وظيفة الآن
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentJobs.map((job) => (
                <div key={job.id} className="sample-list-item" style={{ padding: "14px", borderRadius: "8px", background: "var(--bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border-color, #E2E8F0)" }}>
                  <div>
                    <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>{job.title}</strong>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {job.department} • {job.employmentType} • {job.skills ? (Array.isArray(job.skills) ? job.skills.slice(0, 3).join(", ") : job.skills) : "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`status-pill status-${job.status?.toLowerCase()}`}>
                      {job.status}
                    </span>
                    <Link href={`/company/jobs/${job.id}/edit`} className="btn btn-outline" style={{ padding: "4px 8px", fontSize: "12px" }}>
                      تعديل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applicants */}
        <div className="feature-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>أحدث المتقدمين (ATS)</h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>طلبات التوظيف الواصلة حديثاً</span>
            </div>
            <Link href="/company/applicants" className="table-action-link" style={{ fontSize: "14px" }}>
              عرض كل المرشحين ←
            </Link>
          </div>

          {isLoading ? (
            <p style={{ color: "var(--text-muted)" }}>جاري تحميل المتقدمين...</p>
          ) : recentApplicants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
              <p>لا يوجد متقدمين حتى الآن.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentApplicants.map((app) => (
                <div key={app.id} className="sample-list-item" style={{ padding: "14px", borderRadius: "8px", background: "var(--bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border-color, #E2E8F0)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "15px" }}>{app.candidateName}</strong>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({app.country || "Egypt 🇪🇬"})</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {app.primaryRole} • خبرة {app.yearsExperience} سنوات
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`status-pill status-${app.status?.toLowerCase()}`}>
                      {app.status}
                    </span>
                    <Link href={`/company/applicants/${app.id}`} className="btn btn-outline" style={{ padding: "4px 10px", fontSize: "12px" }}>
                      فحص 🔍
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
