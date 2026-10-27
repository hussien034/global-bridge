import React, { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { api } from "../../services/api";
import { LocalizedContent, useTranslation } from "../../i18n";

export default function CompanyApplicantDetailPage() {
  const { language, t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [applicant, setApplicant] = useState<any | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status change state
  const [newStatus, setNewStatus] = useState<string>("interview");
  const [statusNote, setStatusNote] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  // Add internal note state
  const [noteBody, setNoteBody] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  async function loadData() {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [appRes, notesRes] = await Promise.all([
        api.company.getApplicant(id),
        api.company.getApplicantNotes(id).catch(() => ({ success: false, data: [] })),
      ]);

      if (appRes.success && appRes.data) {
        setApplicant(appRes.data);
        setNewStatus(appRes.data.status || "interview");
      }
      if (notesRes && notesRes.data) {
        setNotes(notesRes.data);
      }
    } catch (err: any) {
      setError(err.message || "تعذّر تحميل بيانات المتقدم.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setIsUpdatingStatus(true);
    setStatusSuccess(null);
    try {
      const res = await api.company.updateApplicantStatus(id, newStatus, statusNote || undefined);
      if (res.success) {
        setStatusSuccess(`تم تحديث مرحلة المرشح بنجاح إلى: ${newStatus}`);
        setStatusNote("");
        loadData();
        setTimeout(() => setStatusSuccess(null), 3000);
      }
    } catch (err: any) {
      alert(t(err.message || "فشل تحديث المرحلة."));
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !noteBody.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await api.company.addApplicantNote(id, noteBody.trim());
      if (res.success) {
        setNoteBody("");
        loadData();
      }
    } catch (err: any) {
      alert(t(err.message || "فشل إضافة الملاحظة."));
    } finally {
      setIsAddingNote(false);
    }
  }

  if (isLoading) {
    return <LocalizedContent>{(
      <div className="container" style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
        جاري تحميل ملف المرشح #{id}...
      </div>
    )}</LocalizedContent>;
  }

  if (!applicant) {
    return <LocalizedContent>{(
      <div className="container" style={{ padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: "#EF4444", fontSize: "16px" }}>⚠️ لم يتم العثور على هذا المرشح أو انتهت صلاحية العرض.</p>
        <Link href="/company/applicants" className="btn btn-outline" style={{ marginTop: "16px" }}>
          العودة لقائمة المتقدمين
        </Link>
      </div>
    )}</LocalizedContent>;
  }

  return <LocalizedContent>{(
    <div className="container" style={{ padding: "32px 24px" }}>
      {/* Header Bar */}
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Link href="/company/dashboard" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                لوحة الشركة
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <Link href="/company/applicants" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
                المتقدمين
              </Link>
              <span style={{ color: "var(--text-muted)" }}>/</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>مرشح #{id}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0 }}>
                {applicant.candidateName}
              </h1>
              <span className={`status-pill status-${applicant.status?.toLowerCase()}`}>
                {applicant.status}
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", margin: "4px 0 0", fontSize: "14px" }}>
              متقدم لوظيفة: <strong>{applicant.job?.title || `الوظيفة #${applicant.jobId}`}</strong> • تاريخ التقديم: {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-GB") : "—"}
            </p>
          </div>

          <div>
            <Link href="/company/applicants" className="btn btn-outline">
              ← العودة لكل المرشحين
            </Link>
          </div>
        </div>
      </div>

      {statusSuccess && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", marginBottom: "20px", fontWeight: 600 }}>
          ✅ {statusSuccess}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="job-detail-layout">
        {/* Main Column */}
        <div className="job-detail-main">
          {/* Candidate Bio & Contact */}
          <section className="detail-section">
            <h3>بيانات المرشح المهنية والتواصل</h3>
            <div className="meta-row"><span>الاسم الكامل:</span> <strong>{applicant.candidateName}</strong></div>
            <div className="meta-row"><span>البريد الإلكتروني:</span> <strong>{applicant.email}</strong></div>
            <div className="meta-row"><span>رقم الهاتف / واتساب:</span> <strong>{applicant.phone || "غير محدد"}</strong></div>
            <div className="meta-row"><span>الدولة ومقر الإقامة:</span> <strong>{applicant.country || "Egypt 🇪🇬"}</strong></div>
            <div className="meta-row"><span>سنوات الخبرة:</span> <strong>{applicant.yearsExperience} سنوات</strong></div>
            <div className="meta-row"><span>الدور الأساسي:</span> <strong>{applicant.primaryRole}</strong></div>
            <div className="meta-row">
              <span>المهارات التقنية:</span>
              <strong>{Array.isArray(applicant.skills) ? applicant.skills.join(", ") : applicant.skills}</strong>
            </div>
            {applicant.trainingInterest && (
              <div className="meta-row" style={{ color: "var(--nile-blue)" }}>
                <span>الاهتمام بالتدريب الدولي:</span> <strong>نعم، مهتم ببرامج إتقان بيئة العمل الدولية</strong>
              </div>
            )}
          </section>

          {/* Links & Portfolio */}
          <section className="detail-section">
            <h3>الملفات والروابط المهنية</h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
              {applicant.linkedinUrl && (
                <a href={applicant.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: "13px" }}>
                  LinkedIn 🔗
                </a>
              )}
              {applicant.githubUrl && (
                <a href={applicant.githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: "13px" }}>
                  GitHub 💻
                </a>
              )}
              {applicant.portfolioUrl && (
                <a href={applicant.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: "13px" }}>
                  Portfolio / الموقع الشخصي 🌐
                </a>
              )}
              {applicant.cvUrl && (
                <a
                  href={applicant.cvUrl.startsWith("uploaded:")
                    ? `/api/company/applicants/${applicant.id}/cv`
                    : applicant.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ fontSize: "13px" }}
                >
                  تحميل السيرة الذاتية (CV) 📄
                </a>
              )}
              {!applicant.linkedinUrl && !applicant.githubUrl && !applicant.cvUrl && (
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>لم يقدم روابط خارجية.</span>
              )}
            </div>
          </section>

          {/* Cover Letter / Introduction */}
          <section className="detail-section">
            <h3>خطاب التقديم والنبذة الشخصية (Cover Letter)</h3>
            <div style={{ padding: "16px", borderRadius: "8px", background: "var(--bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border-color, #E2E8F0)", lineHeight: 1.7, fontSize: "14px", whiteSpace: "pre-line" }}>
              {applicant.introduction || "لا توجد مقدمة مرفقة مع هذا الطلب."}
            </div>
          </section>

          {/* Internal Notes Section */}
          <section className="detail-section">
            <h3>ملاحظات التقييم الداخلي (Internal Notes)</h3>

            {notes.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "12px 0" }}>
                لا توجد ملاحظات داخلية مسجلة بعد لهذا المرشح.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
                {notes.map((n) => (
                  <div key={n.id} className="sample-note-item" style={{ padding: "14px", borderRadius: "8px", background: "var(--bg-subtle, #F8FAFC)", border: "1px solid var(--border-color, #E2E8F0)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <strong style={{ color: "var(--cairo-ink)" }}>{n.author?.name || `المقيّم #${n.userId || ""}`}:</strong>
                      <span style={{ color: "var(--text-muted)" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString(language === "ar" ? "ar-EG" : "en-GB") : ""}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {n.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add note form */}
            <form onSubmit={handleAddNote} style={{ marginTop: "20px" }}>
              <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                إضافة تقييم أو ملاحظة جديدة (مرئية لفريق الشركة الداخلي فقط):
              </label>
              <textarea
                rows={3}
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="اكتب انطباع المقابلة أو تقييم السيرة الذاتية أو نتيجة الاختبار البرمجي..."
                className="input-field"
                required
              />
              <button
                type="submit"
                disabled={isAddingNote || !noteBody.trim()}
                className="btn btn-outline"
                style={{ marginTop: "10px", padding: "8px 18px", fontSize: "13px" }}
              >
                {isAddingNote ? "جاري الحفظ..." : "إضافة الملاحظة ✍️"}
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Status Column */}
        <aside className="job-detail-sidebar">
          <div className="sidebar-meta-card">
            <h4>إجراءات التقييم والمرحلة (ATS Workflow)</h4>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              تغيير المرحلة يقوم بتحديث سجل الأحداث الداخلي للطلب.
            </p>

            <form onSubmit={handleStatusUpdate}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px", fontWeight: 600 }}>
                  المرحلة الجديدة:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="new">New (جديد)</option>
                  <option value="under_review">Under Review (قيد المراجعة)</option>
                  <option value="shortlisted">Shortlisted (القائمة المختصرة)</option>
                  <option value="interview">Interview (المقابلة التقنية)</option>
                  <option value="offer">Offer (عرض عمل)</option>
                  <option value="hired">Hired (تم التعيين 🎉)</option>
                  <option value="rejected">Rejected (اعتذار)</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "6px" }}>
                  سبب أو ملاحظة الانتقال (اختياري):
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="مثال: تم اجتياز المقابلة التقنية بنجاح"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingStatus}
                className="btn btn-primary"
                style={{ width: "100%", padding: "10px", fontSize: "14px" }}
              >
                {isUpdatingStatus ? "جاري التحديث..." : "حفظ وتحديث المرحلة 🚀"}
              </button>
            </form>

            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color, #E2E8F0)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                💡 عند نقل المرشح إلى "Interview" أو "Offer"، سيظهر ذلك مباشرة في مؤشرات لوحة التحكم.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )}</LocalizedContent>;
}
