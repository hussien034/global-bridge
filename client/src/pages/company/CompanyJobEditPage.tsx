import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { api } from "../../services/api";

export default function CompanyJobEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
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

  useEffect(() => {
    if (!id) return;
    async function fetchJob() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.company.getJob(id!);
        if (res.success && res.data) {
          const j = res.data;
          setFormData({
            title: j.title || "",
            department: j.department || "Engineering",
            employmentType: j.employmentType || "Full-time",
            remotePolicy: j.remotePolicy || "Remote - Egypt",
            experienceLevel: j.experienceLevel || "Senior",
            salaryMin: j.salaryMin ? String(j.salaryMin) : "",
            salaryMax: j.salaryMax ? String(j.salaryMax) : "",
            salaryCurrency: j.salaryCurrency || "EUR",
            timezoneOverlap: j.timezoneOverlap || "",
            skills: Array.isArray(j.skills) ? j.skills.join(", ") : (j.skills || ""),
            description: j.description || "",
            responsibilities: j.responsibilities || "",
            requirements: j.requirements || "",
            status: j.status || "active",
          });
        }
      } catch (err: any) {
        setError(err.message || "تعذّر تحميل بيانات الوظيفة.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

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
        status: formData.status as "draft" | "active" | "paused" | "closed",
      };

      const res = await api.company.updateJob(id, payload);
      if (res.success) {
        setSuccess("تم حفظ التعديلات بنجاح!");
        setTimeout(() => setLocation("/company/jobs"), 1200);
      } else {
        setError(res.error || "فشل تحديث بيانات الوظيفة.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ التعديلات.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
        جاري تحميل بيانات الوظيفة #{id}...
      </div>
    );
  }

  return (
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
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>تعديل وظيفة #{id}</span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0" }}>
          تعديل تفاصيل الوظيفة: {formData.title}
        </h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
          حدّث متطلبات الوظيفة ونطاق الراتب وحالة النشر مباشرة
        </p>
      </div>

      {success && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10B981", marginBottom: "20px" }}>
          ✅ {success}
        </div>
      )}

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
              <label>الحالة الحالية</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="active">Active (نشط ومتاح للتقديم)</option>
                <option value="paused">Paused (إيقاف مؤقت)</option>
                <option value="draft">Draft (مسودة)</option>
                <option value="closed">Closed (مغلق)</option>
              </select>
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
              <label>الحد الأدنى للراتب</label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>الحد الأقصى للراتب</label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>عملة الراتب</label>
              <select name="salaryCurrency" value={formData.salaryCurrency} onChange={handleChange} className="input-field">
                <option value="EUR">EUR (€ اليورو)</option>
                <option value="USD">USD ($ الدولار)</option>
                <option value="GBP">GBP (£ الجنيه)</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المهارات المطلوبة (مفصولة بفواصل)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>الوصف العام *</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المسؤوليات *</label>
              <textarea
                name="responsibilities"
                rows={3}
                value={formData.responsibilities}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>المتطلبات *</label>
              <textarea
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-actions-bar" style={{ marginTop: "24px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: "10px 24px" }}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات 💾"}
            </button>
            <Link href="/company/jobs" className="btn btn-outline">
              إلغاء والعودة
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
