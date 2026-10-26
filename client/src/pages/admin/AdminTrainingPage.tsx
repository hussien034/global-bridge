import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

export default function AdminTrainingPage() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTrainings() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.admin.getTrainings();
      if (res.success && res.data) {
        setTrainings(res.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل البرامج التدريبية.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTrainings();
  }, []);

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
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>البرامج التدريبية</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              إدارة مسارات التدريب الاختيارية (Optional Training Tracks)
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              برامج صقل المهارات والتأهيل للعمل عن بُعد للكوادر التقنية في مصر
            </p>
          </div>

          <div>
            <Link href="/training" className="btn btn-outline" style={{ padding: "10px 18px" }}>
              معاينة صفحة التدريبات العامة 🌐
            </Link>
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
            جاري تحميل المسارات التدريبية...
          </div>
        ) : trainings.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px" }}>لا توجد برامج تدريبية مسجلة في النظام.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>عنوان البرنامج التدريبي</th>
                <th>المستوى والمدة</th>
                <th>الصيغة (Format)</th>
                <th>نوع البرنامج</th>
                <th>الحالة</th>
                <th>معاينة</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>{t.title}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      معرف: #{t.id} • {t.instructor || "فريق Global Bridge الأكاديمي"}
                    </div>
                  </td>
                  <td>
                    {t.level || "جميع المستويات"} • {t.duration || "4 أسابيع"}
                  </td>
                  <td>{t.format || "Online Self-paced"}</td>
                  <td>
                    <span className="demo-tag" style={{ background: "rgba(216, 160, 56, 0.15)", color: "var(--egypt-gold-text)" }}>
                      اختياري / Optional
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${t.status === "published" ? "active" : "draft"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/training/${t.slug || t.id}`}
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
