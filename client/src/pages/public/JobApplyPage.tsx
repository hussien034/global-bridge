import React, { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n";

export default function JobApplyPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<any | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    candidateName: "",
    email: "",
    phone: "",
    country: "Egypt",
    yearsExperience: "",
    primaryRole: "Senior Backend Engineer",
    skills: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    introduction: "",
    consent: false,
    trainingInterest: false,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.role !== "candidate") return;
    setFormData((prev) => ({
      ...prev,
      candidateName: prev.candidateName || user.name,
      email: prev.email || user.email,
    }));
  }, [user]);

  useEffect(() => {
    if (!id) return;
    async function loadJob() {
      try {
        setIsLoadingJob(true);
        const res = await api.public.getJob(id!);
        if (res.success && res.data) {
          setJob(res.data);
          setFormData((prev) => ({
            ...prev,
            primaryRole: res.data.title || prev.primaryRole,
          }));
        }
      } catch {
        // non-blocking
      } finally {
        setIsLoadingJob(false);
      }
    }
    loadJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setError(t("apply.fileTooLarge"));
      e.target.value = "";
      setCvFile(null);
      return;
    }
    setError(null);
    setCvFile(file);
  };

  const readCvAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error(t("apply.fileReadError")));
          return;
        }
        resolve(reader.result.split(",")[1] || "");
      };
      reader.onerror = () => reject(new Error(t("apply.fileReadError")));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setError(t("apply.consentRequired"));
      return;
    }

    const targetJobId = job?.id || parseInt(id || "1", 10);
    if (!targetJobId || isNaN(targetJobId)) {
      setError(t("apply.invalidJob"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        jobId: targetJobId,
        candidateName: formData.candidateName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        country: "Egypt",
        yearsExperience: parseInt(formData.yearsExperience, 10),
        primaryRole: formData.primaryRole.trim(),
        skills: skillsArray,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        githubUrl: formData.githubUrl.trim() || undefined,
        portfolioUrl: formData.portfolioUrl.trim() || undefined,
        cvFile: cvFile
          ? { name: cvFile.name, data: await readCvAsBase64(cvFile) }
          : undefined,
        introduction: formData.introduction.trim(),
        consentAt: new Date().toISOString(),
        trainingInterest: formData.trainingInterest,
      };

      const res = await api.public.applyForJob(payload);
      if (res.success) {
        setSubmittedApp({ id: res.applicationId });
      } else {
        setError(res.error || t("common.error"));
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="container" style={{ padding: "60px 24px", maxWidth: "680px" }}>
        <div className="feature-card" style={{ textAlign: "center", padding: "48px 32px", borderTop: "6px solid #10B981" }}>
          <div style={{ fontSize: "54px", marginBottom: "16px" }}>🎉</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 12px 0", color: "var(--cairo-ink)" }}>
            {t("apply.successTitle")}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1.7, margin: "0 0 24px 0" }}>
            {t("apply.successMessage", {
              name: formData.candidateName,
              job: job?.title || `#${id}`,
              company: job?.company?.name || "Global Bridge",
            })}
          </p>

          <div style={{ padding: "16px", borderRadius: "8px", background: "var(--bg-subtle, rgba(0,0,0,0.02))", border: "1px solid var(--border-color, #E2E8F0)", marginBottom: "28px", textAlign: "right" }}>
            <div style={{ fontSize: "14px", marginBottom: "6px" }}>
              <strong>{t("apply.reference")}:</strong> #{submittedApp.id}
            </div>
            <div style={{ fontSize: "14px", marginBottom: "6px" }}>
              <strong>{t("apply.registeredEmail")}:</strong> {formData.email}
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              <strong>{t("apply.initialStatus")}:</strong> <span className="status-pill status-new">{t("apply.initialStatusValue")}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: "12px 24px" }}>
              {t("apply.otherJobs")} 💼
            </Link>
            {formData.trainingInterest && (
              <Link href="/training" className="btn btn-outline" style={{ padding: "12px 24px" }}>
                {t("apply.trainingLink")} 🎓
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: "860px" }}>
      <div className="feature-card" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Link href="/jobs" style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
            {t("nav.jobs")}
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <Link href={`/jobs/${job?.slug || id}`} style={{ color: "var(--nile-blue)", textDecoration: "none", fontSize: "14px" }}>
            {job?.title || `#${id}`}
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{t("apply.directApplication")}</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 6px 0", color: "var(--cairo-ink)" }}>
          {t("apply.title", { job: job?.title || `#${id}` })}
        </h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "15px" }}>
          {t("apply.companyLine", { company: job?.company?.name || "Global Bridge", country: job?.company?.country || t("jobs.countryFallback") })}
        </p>
      </div>

      <div className="form-card-container">
        <div className="form-header-note" style={{ marginBottom: "24px" }}>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>
            💡 <strong>{t("apply.noticeTitle")}:</strong> {t("apply.notice")}
          </p>
        </div>

        {error && (
          <div role="alert" aria-live="polite" style={{ padding: "14px 18px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "24px" }}>
            ⚠️ {error}
          </div>
        )}

        <form className="application-form-shell" onSubmit={handleSubmit}>
          <div className="form-grid">
            <h2 className="application-form-section-title">{t("apply.contactSection")}</h2>
            <div className="form-group">
              <label htmlFor="candidate-name">{t("apply.candidateName")} *</label>
              <input
                id="candidate-name"
                type="text"
                name="candidateName"
                value={formData.candidateName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-email">{t("apply.email")} *</label>
              <input
                id="candidate-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-phone">{t("apply.phone")}</label>
              <input
                id="candidate-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+20 100 000 0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-country">{t("apply.residence")}</label>
              <input
                id="candidate-country"
                type="text"
                name="country"
                value={formData.country}
                className="input-field"
                readOnly
              />
            </div>

            <h2 className="application-form-section-title">{t("apply.experienceSection")}</h2>
            <div className="form-group">
              <label htmlFor="candidate-experience">{t("apply.yearsExperience")} *</label>
              <input
                id="candidate-experience"
                type="number"
                name="yearsExperience"
                min="0"
                max="40"
                value={formData.yearsExperience}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-role">{t("apply.primaryRole")} *</label>
              <input
                id="candidate-role"
                type="text"
                name="primaryRole"
                value={formData.primaryRole}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="candidate-skills">{t("apply.skills")} *</label>
              <input
                id="candidate-skills"
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input-field"
                placeholder="TypeScript, Node.js, SQL, React, Docker"
                required
              />
              <small style={{ color: "var(--text-muted)" }}>{t("apply.skillsHint")}</small>
            </div>

            <h2 className="application-form-section-title">{t("apply.linksSection")}</h2>
            <div className="form-group">
              <label htmlFor="candidate-linkedin">{t("apply.linkedin")}</label>
              <input
                id="candidate-linkedin"
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="input-field"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-github">{t("apply.github")}</label>
              <input
                id="candidate-github"
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="input-field"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-portfolio">{t("apply.portfolio")}</label>
              <input
                id="candidate-portfolio"
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="candidate-cv">{t("apply.cv")}</label>
              <input
                id="candidate-cv"
                type="file"
                name="cvFile"
                accept=".pdf,application/pdf"
                onChange={handleCvChange}
                className="input-field"
              />
              <small style={{ color: "var(--text-muted)" }}>
                {t("apply.cvHint")} {t("apply.cvOptional")}
              </small>
              {cvFile && (
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {t("apply.selectedFile")}: {cvFile.name}
                </span>
              )}
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="application-introduction">
                {t("apply.introduction")}
              </label>
              <textarea
                id="application-introduction"
                name="introduction"
                rows={5}
                maxLength={2000}
                value={formData.introduction}
                onChange={handleChange}
                className="input-field"
                placeholder={t("apply.introductionHint")}
              />
              <small style={{ color: "var(--text-muted)" }}>
                {t("apply.introductionLimit")}
              </small>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="checkbox-label" style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  style={{ marginTop: "4px" }}
                  required
                />
                <span style={{ fontSize: "14px", lineHeight: 1.6 }}>
                  {t("apply.consent")} *
                </span>
              </label>
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="checkbox-label" style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="trainingInterest"
                  checked={formData.trainingInterest}
                  onChange={handleChange}
                  style={{ marginTop: "4px" }}
                />
                <span style={{ fontSize: "14px", lineHeight: 1.6 }}>
                  {t("apply.trainingInterest")}
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions-bar" style={{ marginTop: "28px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: "12px 36px", fontSize: "16px" }}
            >
              {isSubmitting ? t("apply.submitting") : t("apply.submit")}
            </button>
            <Link href={`/jobs/${job?.slug || id}`} className="btn btn-outline">
              {t("apply.cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
