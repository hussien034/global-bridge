import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

type RegistrationRequest = {
  id: number;
  requestType: "partnership" | "admin_access";
  companyName: string;
  contactPerson: string | null;
  workEmail: string;
  website: string | null;
  country: string;
  rolesNeeded: string;
  message: string | null;
  status: "new" | "contacted" | "partnered" | "closed";
  createdAt: string;
};

const STATUS_LABELS: Record<RegistrationRequest["status"], string> = {
  new: "قيد المراجعة",
  contacted: "تم التواصل",
  partnered: "تمت الموافقة",
  closed: "مغلق",
};

export default function AdminRegistrationRequestsPage() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "partnership" | "admin_access">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadRequests() {
    try {
      setIsLoading(true);
      setError(null);
      const [partnerships, adminRequests] = await Promise.all([
        filter === "admin_access" ? Promise.resolve({ success: true, data: [] }) : api.admin.getLeads(undefined, "partnership"),
        filter === "partnership" ? Promise.resolve({ success: true, data: [] }) : api.admin.getLeads(undefined, "admin_access"),
      ]);
      setRequests([
        ...(partnerships.data || []),
        ...(adminRequests.data || []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحميل طلبات التسجيل.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [filter]);

  async function updateStatus(request: RegistrationRequest, status: RegistrationRequest["status"]) {
    setUpdatingId(request.id);
    setError(null);
    setSuccess(null);
    try {
      await api.admin.updateLeadStatus(request.id, status);
      setSuccess("تم تحديث حالة الطلب.");
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحديث حالة الطلب.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="container" style={{ padding: "32px 24px" }}>
      <div className="feature-card" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, color: "var(--text-primary)" }}>طلبات التسجيل والصلاحيات</h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          راجع طلبات الشراكة وطلبات صلاحية إدارة المنصة. اعتماد الطلب لا ينشئ الحساب تلقائياً؛ إصدار الحسابات يظل عبر إجراءات الإدارة الآمنة.
        </p>
      </div>

      <div className="feature-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>صندوق الطلبات</h2>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 13 }}>
            نوع الطلب
            <select className="input-field" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} style={{ width: "auto", minWidth: 180 }}>
              <option value="all">كل الطلبات</option>
              <option value="partnership">طلبات الشركات</option>
              <option value="admin_access">صلاحية Admin</option>
            </select>
          </label>
        </div>

        {error && <div role="alert" style={{ padding: 12, marginBottom: 16, borderRadius: 10, color: "#B91C1C", background: "#FEF2F2" }}>{error}</div>}
        {success && <div role="status" style={{ padding: 12, marginBottom: 16, borderRadius: 10, color: "#166534", background: "#F0FDF4" }}>{success}</div>}
        {isLoading ? (
          <p style={{ color: "var(--text-muted)" }}>جارٍ تحميل الطلبات...</p>
        ) : requests.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>لا توجد طلبات في هذا التصنيف.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {requests.map((request) => {
              const isAdminRequest = request.requestType === "admin_access";
              return (
                <article key={`${request.requestType}-${request.id}`} className="registration-request-card">
                  <div className="registration-request-heading">
                    <div>
                      <span className="demo-tag">{isAdminRequest ? "طلب صلاحية Admin" : "طلب شراكة شركة"}</span>
                      <h3>{isAdminRequest ? request.contactPerson : request.companyName}</h3>
                      <p>{request.contactPerson && !isAdminRequest ? `${request.contactPerson} · ` : ""}{request.workEmail}</p>
                    </div>
                    <span className={`status-pill status-${request.status === "new" ? "new" : request.status === "contacted" ? "interview" : request.status === "partnered" ? "active" : "draft"}`}>
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>
                  {!isAdminRequest && (
                    <div className="registration-request-meta">
                      <span>الدولة: {request.country}</span>
                      <span>الموقع: {request.website || "غير مذكور"}</span>
                      <span>التخصصات: {request.rolesNeeded}</span>
                    </div>
                  )}
                  {isAdminRequest && <p className="registration-request-reason">{request.message}</p>}
                  <div className="registration-request-footer">
                    <time dateTime={request.createdAt}>{new Date(request.createdAt).toLocaleString("ar-EG")}</time>
                    <div className="registration-request-actions">
                      {request.status !== "contacted" && (
                        <button type="button" className="btn btn-outline" disabled={updatingId === request.id} onClick={() => updateStatus(request, "contacted")}>تم التواصل</button>
                      )}
                      {request.status !== "partnered" && (
                        <button type="button" className="btn btn-primary" disabled={updatingId === request.id} onClick={() => updateStatus(request, "partnered")}>اعتماد الطلب</button>
                      )}
                      {request.status !== "closed" && (
                        <button type="button" className="btn btn-outline" disabled={updatingId === request.id} onClick={() => updateStatus(request, "closed")}>إغلاق</button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
