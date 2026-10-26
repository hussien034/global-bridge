import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadJobs(statusFilter?: string) {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.admin.getJobs(params);
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل الوظائف.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJobs(selectedStatus);
  }, [selectedStatus]);

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
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>إدارة كافة الوظائف</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              كافة الوظائف المنشورة عبر المنصة
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              مراقبة وإشراف على كافة الوظائف المعلنة من مختلف الشركاء الأجانب
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {["", "active", "paused", "draft", "closed"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`btn ${selectedStatus === st ? "btn-primary" : "btn-outline"}`}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {st === "" ? "الكل" : st}
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
            جاري تحميل الوظائف...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px" }}>لا توجد وظائف مطابقة للفلتر.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>الوظيفة</th>
                <th>الشركة</th>
                <th>القسم والدوام</th>
                <th>نطاق الراتب</th>
                <th>الحالة</th>
                <th>معاينة</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>{j.title}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      معرف: #{j.id} • {j.experienceLevel}
                    </div>
                  </td>
                  <td>
                    <strong>{j.company?.name || `شركة #${j.companyId}`}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{j.company?.country}</div>
                  </td>
                  <td>{j.department} • {j.employmentType}</td>
                  <td>
                    {j.salaryMin && j.salaryMax
                      ? `${j.salaryMin} - ${j.salaryMax} ${j.salaryCurrency || "EUR"}`
                      : "—"}
                  </td>
                  <td>
                    <span className={`status-pill status-${j.status?.toLowerCase()}`}>
                      {j.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/jobs/${j.slug || j.id}`}
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      معاينة في الموقع 🌐
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
