import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

export default function CompanyApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadApplicants(statusFilter?: string) {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.company.getApplicants(params);
      if (res.success && res.data) {
        setApplicants(res.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل قائمة المتقدمين.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplicants(selectedStatus);
  }, [selectedStatus]);

  const statusTabs = [
    { label: "الكل", value: "" },
    { label: "جديد (New)", value: "new" },
    { label: "قيد المراجعة", value: "under_review" },
    { label: "القائمة المختصرة", value: "shortlisted" },
    { label: "المقابلة", value: "interview" },
    { label: "عرض عمل (Offer)", value: "offer" },
    { label: "تم التعيين (Hired)", value: "hired" },
    { label: "معتذر عنه", value: "rejected" },
  ];

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Link href="/company/dashboard" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                لوحة الشركة
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>نظام متابعة المرشحين (ATS)</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              إدارة وفرز المتقدمين لوظائف الشركة
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              فحص السير الذاتية وتغيير مراحل التقييم والملاحظات الفنية للمهندسين المصريين
            </p>
          </div>

          <div>
            <Link href="/company/jobs" className="btn btn-outline" style={{ padding: "10px 18px" }}>
              إدارة الوظائف المعلنة
            </Link>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px" }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`btn ${selectedStatus === tab.value ? "btn-primary" : "btn-outline"}`}
            style={{ padding: "6px 14px", fontSize: "13px", whiteSpace: "nowrap" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="table-card-container">
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            جاري تحميل طلبات التقديم...
          </div>
        ) : applicants.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px" }}>لا توجد طلبات تقديم مطابقة للفلتر المحدد.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>اسم المرشح</th>
                <th>الوظيفة المتقدم لها</th>
                <th>سنوات الخبرة</th>
                <th>المهارات</th>
                <th>المرحلة الحالية</th>
                <th>تاريخ التقديم</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>{app.candidateName}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {app.email} • {app.country || "Egypt 🇪🇬"}
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: "14px" }}>{app.jobTitle || app.job?.title || `الوظيفة #${app.jobId}`}</strong>
                  </td>
                  <td>{app.yearsExperience} سنوات</td>
                  <td style={{ maxWidth: "200px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {app.skills ? (Array.isArray(app.skills) ? app.skills.slice(0, 3).join(", ") : app.skills) : "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${app.status?.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString("ar-EG") : "—"}
                  </td>
                  <td>
                    <Link
                      href={`/company/applicants/${app.id}`}
                      className="btn btn-outline"
                      style={{ padding: "6px 14px", fontSize: "13px", fontWeight: 600 }}
                    >
                      فحص وتقييم 🔍
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
