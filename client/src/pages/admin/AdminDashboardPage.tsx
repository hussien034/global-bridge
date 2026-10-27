import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { LocalizedContent, useTranslation } from "../../i18n";

export default function AdminDashboardPage() {
  const { language } = useTranslation();
  const [stats, setStats] = useState<any | null>(null);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        setIsLoading(true);
        setError(null);
        const [dashRes, compRes, actRes] = await Promise.all([
          api.admin.getDashboard().catch(() => ({ success: false, data: null })),
          api.admin.getCompanies().catch(() => ({ success: false, data: [] })),
          api.admin.getActivity(6).catch(() => ({ success: false, data: [] })),
        ]);

        if (isMounted) {
          if (dashRes && dashRes.data) setStats(dashRes.data);
          if (compRes && compRes.data) setCompaniesList(compRes.data.slice(0, 4));
          if (actRes && actRes.data) setActivities(actRes.data);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "تعذّر تحميل بيانات لوحة الإدارة.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const adminStats = [
    {
      label: "إجمالي الشركات المسجلة",
      value: stats ? stats.totalCompanies.toString() : "—",
      icon: "🏢",
      sub: stats ? `${stats.activeCompanies} نشطة` : "...",
      color: "var(--nile-blue)",
    },
    {
      label: "إجمالي الوظائف",
      value: stats ? stats.totalJobs.toString() : "—",
      icon: "📑",
      sub: stats ? `${stats.activeJobs} متاح للتقديم` : "...",
      color: "#10B981",
    },
    {
      label: "إجمالي المتقدمين",
      value: stats ? stats.totalApplicants.toString() : "—",
      icon: "👥",
      sub: stats ? `${stats.newApplicants} جديد` : "...",
      color: "var(--egypt-gold)",
    },
    {
      label: "المقابلات والتعيينات",
      value: stats ? (stats.interviewCount + stats.offerCount + stats.hiredCount).toString() : "—",
      icon: "🎯",
      sub: stats ? `${stats.hiredCount} تم التعاقد` : "...",
      color: "#8B5CF6",
    },
  ];

  return <LocalizedContent>{(
    <div className="container" style={{ padding: "32px 24px" }}>
      {/* Top Header */}
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="demo-tag" style={{ background: "rgba(216, 160, 56, 0.15)", color: "var(--egypt-gold-text)" }}>
                Super Admin Console
              </span>
              <span className="status-pill status-active">Full System Access</span>
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 8px 0" }}>
              لوحة الإدارة المركزية لمنصة Global Bridge
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "15px" }}>
              إشراف شامل على الشركات الأوروبية والعالمية، ومتابعة حركة التوظيف وتدقيق العمليات
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/admin/companies" className="btn btn-primary" style={{ padding: "10px 18px" }}>
              إدارة الشركات الشريكة
            </Link>
            <Link href="/admin/activity" className="btn btn-outline" style={{ padding: "10px 18px" }}>
              سجل تدقيق الأنشطة (Audit Trail)
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
        {adminStats.map((s, idx) => (
          <div key={idx} className="stat-card" style={{ borderTop: `4px solid ${s.color}` }}>
            <div className="stat-header">
              <span className="stat-icon" style={{ fontSize: "24px" }}>{s.icon}</span>
              <span className="stat-badge">{s.sub}</span>
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

      {/* Grid: Companies & Audit Feed */}
      <div className="dashboard-grid-two-col" style={{ marginTop: "32px" }}>
        {/* Partner Companies */}
        <div className="feature-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>الشركات والشركاء المسجلون</h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>الشركات المسجلة في النظام</span>
            </div>
            <Link href="/admin/companies" className="table-action-link" style={{ fontSize: "14px" }}>
              عرض كل الشركات ({companiesList.length}) ←
            </Link>
          </div>

          {isLoading ? (
            <p style={{ color: "var(--text-muted)" }}>جاري تحميل الشركات...</p>
          ) : companiesList.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>لا توجد شركات مسجلة.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {companiesList.map((comp) => (
                <div key={comp.id} className="sample-list-item" style={{ padding: "14px", borderRadius: "8px", background: "var(--bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border-color, #E2E8F0)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "15px" }}>{comp.name}</strong>
                      {comp.isDemo && <span className="demo-tag">Demo Partner</span>}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {comp.country} • {comp.website || "بدون موقع"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`status-pill status-${comp.verificationStatus === "verified" ? "active" : "draft"}`}>
                      {comp.verificationStatus || comp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Trail Activity Feed */}
        <div className="feature-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>سجل الأحداث والأنشطة المباشرة</h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>أحدث التغييرات في المنصة</span>
            </div>
            <Link href="/admin/activity" className="table-action-link" style={{ fontSize: "14px" }}>
              السجل الكامل ←
            </Link>
          </div>

          {isLoading ? (
            <p style={{ color: "var(--text-muted)" }}>جاري تحميل سجل النشاط...</p>
          ) : activities.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>لا توجد أنشطة مسجلة في السجل.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activities.map((act) => (
                <div key={act.id} className="sample-list-item" style={{ padding: "12px 14px", borderRadius: "8px", background: "var(--bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border-color, #E2E8F0)" }}>
                  <div>
                    <strong style={{ fontSize: "14px", display: "block" }}>
                      {act.title || act.action || `حدث #${act.id}`}
                    </strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {act.description || act.details || act.note || "—"}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {act.createdAt ? new Date(act.createdAt).toLocaleTimeString(language === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "الآن"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )}</LocalizedContent>;
}
