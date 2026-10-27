import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { LocalizedContent, useTranslation } from "../../i18n";

export default function CompanyJobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  async function loadJobs() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.company.getJobs();
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
    loadJobs();
  }, []);

  async function handleToggleStatus(jobId: number, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await api.company.updateJob(jobId, { status: nextStatus });
      setActionSuccess(`تم تغيير حالة الوظيفة #${jobId} إلى ${nextStatus}`);
      loadJobs();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(t(err.message || "فشل تغيير حالة الوظيفة."));
    }
  }

  async function handleCloseJob(jobId: number, title: string) {
    if (!window.confirm(t("هل تريد إغلاق الوظيفة \"{{title}}\"؟", { title }))) {
      return;
    }
    try {
      await api.company.updateJob(jobId, { status: "closed" });
      setActionSuccess(`تم إغلاق الوظيفة #${jobId} بنجاح.`);
      loadJobs();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(t(err.message || "فشل إغلاق الوظيفة."));
    }
  }

  return <LocalizedContent>{(
    <div className="container" style={{ padding: "32px 24px" }}>
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Link href="/company/dashboard" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                لوحة الشركة
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>إدارة الوظائف</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              إدارة وظائف الشركة المعلنة
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              نشر وتعديل وتغيير حالات وظائف العمل عن بُعد واستقبال كفاءات مصر
            </p>
          </div>

          <div>
            <Link href="/company/jobs/new" className="btn btn-primary" style={{ padding: "10px 20px" }}>
              + إنشاء وظيفة جديدة 🚀
            </Link>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", marginBottom: "20px", fontWeight: 600 }}>
          ✅ {actionSuccess}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="table-card-container">
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            جاري تحميل الوظائف من الخادم...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px", marginBottom: "16px" }}>لا توجد وظائف معلنة لشركتك حالياً.</p>
            <Link href="/company/jobs/new" className="btn btn-primary">
              نشر أول وظيفة الآن
            </Link>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>المسمى الوظيفي</th>
                <th>القسم</th>
                <th>طبيعة الدوام</th>
                <th>نطاق الراتب</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>{job.title}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {job.experienceLevel} • {job.skills ? (Array.isArray(job.skills) ? job.skills.slice(0, 3).join(", ") : job.skills) : ""}
                    </div>
                  </td>
                  <td>{job.department || "Engineering"}</td>
                  <td>{job.employmentType || "Full-time"}</td>
                  <td>
                    {job.salaryMin && job.salaryMax
                      ? `${job.salaryMin} - ${job.salaryMax} ${job.salaryCurrency || "EUR"}`
                      : "غير محدد"}
                  </td>
                  <td>
                    <span className={`status-pill status-${job.status?.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Link
                        href={`/company/jobs/${job.id}/edit`}
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        تعديل ✏️
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(job.id, job.status)}
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        {job.status === "active" ? "إيقاف مؤقت ⏸️" : "تفعيل ▶️"}
                      </button>
                      <Link
                        href={`/jobs/${job.slug || job.id}`}
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        معاينة 🌐
                      </Link>
                      <button
                        onClick={() => handleCloseJob(job.id, job.title)}
                        className="btn btn-outline"
                        disabled={job.status === "closed"}
                        style={{ padding: "4px 8px", fontSize: "12px", color: "#EF4444" }}
                      >
                        إغلاق الوظيفة
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )}</LocalizedContent>;
}
