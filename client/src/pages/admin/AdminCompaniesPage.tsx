import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { LocalizedContent, useTranslation } from "../../i18n";

export default function AdminCompaniesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLogoCompany, setEditingLogoCompany] = useState<any | null>(null);
  const [logoUrlDraft, setLogoUrlDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verifyingCompanyId, setVerifyingCompanyId] = useState<number | null>(null);

  const [newCompany, setNewCompany] = useState({
    name: "",
    country: "Netherlands",
    website: "",
    logoUrl: "",
    description: "شركة برمجيات أوروبية متخصصة في الحلول السحابية.",
    verificationStatus: "verified",
    isDemo: false,
    accountName: "",
    accountEmail: "",
    accountPassword: "",
  });

  async function loadCompanies() {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.admin.getCompanies();
      if (res.success && res.data) {
        setCompanies(res.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل الشركات.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = newCompany.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const res = await api.admin.createCompany({
        name: newCompany.name.trim(),
        slug,
        country: newCompany.country,
        website: newCompany.website,
        logoUrl: newCompany.logoUrl.trim(),
        description: newCompany.description,
        verificationStatus: newCompany.verificationStatus,
        status: "active",
        isDemo: newCompany.isDemo,
        accountName: newCompany.accountName.trim(),
        accountEmail: newCompany.accountEmail.trim(),
        accountPassword: newCompany.accountPassword,
      });

      if (res.success) {
        setSuccessMsg(`تمت إضافة الشركة "${newCompany.name}" بنجاح!`);
        setShowAddModal(false);
        setNewCompany({
          name: "",
          country: "Netherlands",
          website: "",
          logoUrl: "",
          description: "شركة برمجيات أوروبية متخصصة في الحلول السحابية.",
          verificationStatus: "verified",
          isDemo: false,
          accountName: "",
          accountEmail: "",
          accountPassword: "",
        });
        loadCompanies();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      alert(t(err.message || "فشل إضافة الشركة."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateLogo(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLogoCompany) return;

    setIsSubmitting(true);
    try {
      const res = await api.admin.updateCompany(editingLogoCompany.id, {
        logoUrl: logoUrlDraft.trim(),
      });
      if (!res.success) {
        throw new Error(res.error || "فشل تحديث شعار الشركة.");
      }

      setSuccessMsg(`تم تحديث شعار "${editingLogoCompany.name}" بنجاح.`);
      setEditingLogoCompany(null);
      setLogoUrlDraft("");
      await loadCompanies();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(t(err.message || "فشل تحديث شعار الشركة."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(companyId: number, currentStatus: string) {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await api.admin.updateCompany(companyId, { status: nextStatus });
      setSuccessMsg(`تم تحديث حالة الشركة #${companyId}`);
      loadCompanies();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(t(err.message || "فشل تحديث الشركة."));
    }
  }

  async function handleVerifyCompany(companyId: number) {
    setVerifyingCompanyId(companyId);
    setError(null);
    try {
      await api.admin.updateCompany(companyId, { verificationStatus: "verified" });
      setSuccessMsg(t("adminCompanies.verifySuccess"));
      await loadCompanies();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : t("adminCompanies.verifyError"));
    } finally {
      setVerifyingCompanyId(null);
    }
  }

  return <LocalizedContent>{(
    <div className="container" style={{ padding: "32px 24px" }}>
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Link href="/admin" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                لوحة الإدارة
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>إدارة الشركات والشركاء</span>
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
              الشركات وحسابات الشركاء
            </h1>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
              مراجعة بيانات الشركات، إنشاء حسابات مسؤوليها، وتفعيل أو تعليق الوصول
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ padding: "10px 20px" }}
            >
              + إضافة شركة جديدة 🏢
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", marginBottom: "20px", fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "12px", maxWidth: "550px", width: "100%", padding: "24px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "16px" }}>إضافة شريك تقني جديد (Company)</h2>
            <form onSubmit={handleCreateCompany}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>اسم الشركة *</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="مثال: Nordics Tech Lab"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>الدولة</label>
                  <input
                    type="text"
                    value={newCompany.country}
                    onChange={(e) => setNewCompany({ ...newCompany, country: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>الموقع الإلكتروني</label>
                  <input
                    type="url"
                    required
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>رابط شعار الشركة *</label>
                  <input
                    type="url"
                    required
                    value={newCompany.logoUrl}
                    onChange={(e) => setNewCompany({ ...newCompany, logoUrl: e.target.value })}
                    placeholder="https://company.com/logo.png"
                    className="input-field"
                  />
                  <small style={{ display: "block", marginTop: "5px", color: "var(--text-muted)" }}>
                    استخدم رابطاً مباشراً لصورة الشعار بصيغة PNG أو SVG أو WebP.
                  </small>
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>اسم مسؤول الحساب *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={newCompany.accountName}
                    onChange={(e) => setNewCompany({ ...newCompany, accountName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>بريد تسجيل دخول الشركة *</label>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={newCompany.accountEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, accountEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>كلمة مرور أولية *</label>
                  <input
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    value={newCompany.accountPassword}
                    onChange={(e) => setNewCompany({ ...newCompany, accountPassword: e.target.value })}
                    className="input-field"
                  />
                  <small style={{ display: "block", marginTop: "5px", color: "var(--text-muted)" }}>
                    12 حرفاً على الأقل؛ شاركها مع مسؤول الشركة بطريقة آمنة.
                  </small>
                </div>
                <div>
                  <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>الوصف والنشاط</label>
                  <textarea
                    rows={3}
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={newCompany.isDemo}
                      onChange={(e) => setNewCompany({ ...newCompany, isDemo: e.target.checked })}
                    />
                    حساب وبيانات تجريبية (Demo Partner)
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCompany.name.trim() || !newCompany.logoUrl.trim()}
                  className="btn btn-primary"
                >
                  {isSubmitting ? "جاري الإضافة..." : "حفظ الشركة 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingLogoCompany && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "var(--surface-white)", color: "var(--text-primary)", borderRadius: "12px", maxWidth: "480px", width: "100%", padding: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>تحديث شعار {editingLogoCompany.name}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              سيظهر الشعار بجوار اسم الشركة في بطاقات الوظائف.
            </p>
            <form onSubmit={handleUpdateLogo}>
              <label htmlFor="company-logo-url" style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>رابط الشعار *</label>
              <input
                id="company-logo-url"
                type="url"
                required
                value={logoUrlDraft}
                onChange={(e) => setLogoUrlDraft(e.target.value)}
                placeholder="https://company.com/logo.png"
                className="input-field"
              />
              {logoUrlDraft && (
                <div style={{ display: "flex", justifyContent: "center", padding: "16px" }}>
                  <img
                    src={logoUrlDraft}
                    alt={`معاينة شعار ${editingLogoCompany.name}`}
                    style={{ width: "72px", height: "72px", objectFit: "contain", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-white)" }}
                  />
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setEditingLogoCompany(null)} className="btn btn-outline">
                  إلغاء
                </button>
                <button type="submit" disabled={isSubmitting || !logoUrlDraft.trim()} className="btn btn-primary">
                  {isSubmitting ? "جاري الحفظ..." : "حفظ الشعار"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-card-container">
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            جاري تحميل الشركات...
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "16px" }}>لا توجد شركات مسجلة في النظام.</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>الشعار</th>
                <th>اسم الشركة</th>
                <th>الدولة</th>
                <th>الموقع الإلكتروني</th>
                <th>وسم Demo</th>
                <th>حالة الاعتماد</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="admin-company-logo" title={c.name}>
                      {(c.name || "GB").slice(0, 2).toUpperCase()}
                      {c.logoUrl && (
                        <img
                          src={c.logoUrl}
                          alt=""
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      )}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "15px", color: "var(--cairo-ink)" }}>{c.name}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      معرف: #{c.id} • {c.slug}
                    </div>
                  </td>
                  <td>{c.country}</td>
                  <td>
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer" style={{ color: "var(--nile-blue)", textDecoration: "none" }}>
                        {c.website.replace("https://", "")} ↗
                      </a>
                    ) : "—"}
                  </td>
                  <td>
                    {c.isDemo ? (
                      <span className="demo-tag">Demo Partner</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>حقيقي</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill status-${c.verificationStatus === "verified" ? "active" : "draft"}`}>
                      {c.verificationStatus || "verified"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${c.status?.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.verificationStatus !== "verified" && (
                      <button
                        onClick={() => handleVerifyCompany(c.id)}
                        className="btn btn-primary"
                        disabled={verifyingCompanyId === c.id}
                        style={{ padding: "4px 10px", fontSize: "12px", marginInlineEnd: "6px" }}
                      >
                        {verifyingCompanyId === c.id ? t("adminCompanies.verifying") : t("adminCompanies.verify")}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingLogoCompany(c);
                        setLogoUrlDraft(c.logoUrl || "");
                      }}
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "12px", marginInlineEnd: "6px" }}
                    >
                      {c.logoUrl ? "تعديل الشعار" : "إضافة الشعار"}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      {c.status === "active" ? "تعليق الحساب ⏸️" : "تفعيل الحساب ▶️"}
                    </button>
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
