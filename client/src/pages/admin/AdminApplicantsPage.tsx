import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

export default function AdminApplicantsPage() {
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
      const res = await api.admin.getApplicants(params);
      if (res.success && res.data) {
        setApplicants(res.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل المتقدمين.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplicants(selectedStatus);
  }, [selectedStatus]);

  const stages = [
    { label: "الكل", value: "" },
    { label: "جديد (New)", value: "new" },
    { label: "قيد المراجعة", value: "under_review" },
    { label: "المقابلة (Interview)", value: "interview" },
    { label: "عرض عمل (Offer)", value: "offer" },
    { label: "تم التعيين (Hired)", value: "hired" },
    { label: "اعتذار (Rejected)", value: "rejected" },
  ];

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Link href="/admin" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                لوحة الإدارة
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>سجل المتقدمين الشامل</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              سجل كافة طلبات التوظيف عبر المنصة
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              نظرة مركزية على تدفق الكفاءات المصرية نحو الشركات الشريكة
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
            {stages.map((st) => (
              <button
                key={st.value}
                onClick={() => setSelectedStatus(st.value)}
                className={`btn ${selectedStatus === st.value ? "btn-primary" : "btn-outline"}`}
                style={{ padding: "6px 12px", fontSize: "12px", whiteSpace: "nowrap" }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
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
            <p style={{ fontSize: "16px" }}>لا توجد طلبات تقديم مطابقة للفلتر.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>اسم المرشح</th>
                <th>الوظيفة والشركة</th>
                <th>سنوات الخبرة</th>
                <th>الدور والمهارات</th>
                <th>المرحلة</th>
                <th>تاريخ التقديم</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>{a.candidateName}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{a.email}</div>
                  </td>
                  <td>
                    <strong style={{ fontSize: "14px" }}>{a.jobTitle || a.job?.title || `وظيفة #${a.jobId}`}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {a.companyName || a.job?.company?.name || "الشركة المرتبطة بالوظيفة"}
                    </div>
                  </td>
                  <td>{a.yearsExperience} سنوات</td>
                  <td>
                    <div style={{ fontSize: "13px" }}>{a.primaryRole}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {a.skills ? (Array.isArray(a.skills) ? a.skills.slice(0, 3).join(", ") : a.skills) : ""}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill status-${a.status?.toLowerCase()}`}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString("ar-EG") : "—"}
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
