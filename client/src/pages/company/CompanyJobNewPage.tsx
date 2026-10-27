import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { api } from "../../services/api";
import { LocalizedContent } from "../../i18n";

export default function CompanyJobNewPage() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "Engineering",
    employmentType: "Full-time",
    remotePolicy: "Remote - Egypt",
    experienceLevel: "Senior",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "EUR",
    timezoneOverlap: "",
    skills: "",
    description: "",
    responsibilities: "",
    requirements: "",
    status: "active",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        department: formData.department.trim(),
        employmentType: formData.employmentType,
        remotePolicy: formData.remotePolicy,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin, 10) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax, 10) : undefined,
        salaryCurrency: formData.salaryCurrency,
        timezoneOverlap: formData.timezoneOverlap,
        skills: formData.skills.trim(),
        description: formData.description.trim(),
        responsibilities: formData.responsibilities.trim(),
        requirements: formData.requirements.trim(),
        status: formData.status as "draft" | "active",
      };

      const res = await api.company.createJob(payload);
      if (res.success) {
        setLocation("/company/jobs");
      } else {
        setError(res.error || "فشل إنشاء الوظيفة.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ الوظيفة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <LocalizedContent>{(
    <div className="container" style={{ padding: "32px 24px" }}>
      <div className="feature-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Link href="/company/dashboard" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
            لوحة الشركة
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <Link href="/company/jobs" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
            الوظائف
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>نشر وظيفة جديدة</span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
          إنشاء ونشر فرصة عمل جديدة للمطورين في مصر
        </h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
          أدخل تفاصيل دقيقة عن الدور؛ اترك معلومات الراتب أو التوقيت فارغة إذا لم تكن محددة.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="form-card-container">
        <form className="application-form-shell" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المسمى الوظيفي *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="مثال: Senior Full-Stack Engineer"
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label>القسم / التخصص</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label>طبيعة الدوام</label>
              <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="input-field">
                <option value="Full-time">Full-time (دوام كامل)</option>
                <option value="Part-time">Part-time (دوام جزئي)</option>
                <option value="Contract">Contract (عقد)</option>
                <option value="Internship">Internship (تدريب)</option>
              </select>
            </div>

            <div className="form-group">
              <label>مستوى الخبرة</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input-field">
                <option value="Junior">Junior (1-2 سنوات)</option>
                <option value="Mid-level">Mid-level (3-5 سنوات)</option>
                <option value="Senior">Senior (5+ سنوات)</option>
                <option value="Lead / Architect">Lead / Architect (قائد تقني)</option>
              </select>
            </div>

            <div className="form-group">
              <label>سياسة العمل عن بُعد</label>
              <select name="remotePolicy" value={formData.remotePolicy} onChange={handleChange} className="input-field">
                <option value="Remote - Egypt">Remote - Egypt (عن بُعد من مصر)</option>
                <option value="Remote - Global">Remote - Global (عن بُعد عالمي)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label>الحد الأدنى للراتب الشهري</label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                className="input-field"
                placeholder="3000"
              />
            </div>

            <div className="form-group">
              <label>الحد الأقصى للراتب الشهري</label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                className="input-field"
                placeholder="5000"
              />
            </div>

            <div className="form-group">
              <label>عملة الراتب</label>
              <select name="salaryCurrency" value={formData.salaryCurrency} onChange={handleChange} className="input-field">
                <option value="EUR">EUR (€ اليورو الأوروبي)</option>
                <option value="USD">USD ($ الدولار الأمريكي)</option>
                <option value="GBP">GBP (£ الجنيه الإسترليني)</option>
              </select>
            </div>

            <div className="form-group">
              <label>توافق المنطقة الزمنية</label>
              <input
                type="text"
                name="timezoneOverlap"
                value={formData.timezoneOverlap}
                onChange={handleChange}
                className="input-field"
                placeholder="±2 hours from Cairo"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المهارات المطلوبة (مفصولة بفواصل) *</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="TypeScript, Node.js, React, Docker, PostgreSQL"
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>الوصف العام للوظيفة *</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="عرّف بالدور والفريق والمنتج، واذكر موقع العمل وسياسة الدوام."
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المسؤوليات اليومية *</label>
              <textarea
                name="responsibilities"
                rows={3}
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="اكتب المسؤوليات الفعلية لهذا الدور."
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المتطلبات والشروط الأساسية *</label>
              <textarea
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleChange}
                placeholder="اذكر الخبرات والمهارات المطلوبة لهذا الدور."
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label>حالة النشر الفوري</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="active">Active (نشر فوري متاح للتقديم)</option>
                <option value="draft">Draft (مسودة غير معلنة)</option>
              </select>
            </div>
          </div>

          <div className="form-actions-bar" style={{ marginTop: "24px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: "10px 24px" }}
            >
              {isSubmitting ? "جاري النشر..." : "حفظ ونشر الوظيفة 🚀"}
            </button>
            <Link href="/company/jobs" className="btn btn-outline">
              إلغاء والعودة
            </Link>
          </div>
        </form>
      </div>
    </div>
  )}</LocalizedContent>;
}
