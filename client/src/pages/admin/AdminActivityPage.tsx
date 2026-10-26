import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";

export default function AdminActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.admin.getActivity(50);
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل سجل الأحداث.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
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
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>سجل التدقيق والأحداث</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              سجل أنشطة وتدقيق المنصة (Audit Trail)
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              سجل للعمليات وتغييرات مراحل الطلبات المسجلة في المنصة
            </p>
          </div>

          <div>
            <button onClick={loadEvents} className="btn btn-outline" style={{ padding: "8px 16px" }}>
              تحديث السجل 🔄
            </button>
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
            جاري تحميل سجل الأنشطة...
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px" }}>لا توجد أنشطة مسجلة في السجل.</p>
          </div>
        ) : (
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {events.map((act) => (
                <div
                  key={act.id}
                  className="sample-list-item"
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    background: "var(--bg-subtle, rgba(0,0,0,0.02))",
                    border: "1px solid var(--border-color, #E2E8F0)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span className="demo-tag" style={{ background: "color-mix(in srgb, var(--nile-blue) 10%, transparent)", color: "var(--nile-blue)" }}>
                        {act.eventType || act.action || "EVENT"}
                      </span>
                      <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>
                        {act.title || act.action || `حدث رقم #${act.id}`}
                      </strong>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                      {act.description || act.details || act.note || "تم تسجيل الحدث بنجاح"}
                    </div>
                    {act.actor && (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        بواسطة: {act.actor.name || act.actor.email || `مستخدم #${act.actorId}`}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {act.createdAt ? new Date(act.createdAt).toLocaleString("ar-EG") : "الآن"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
