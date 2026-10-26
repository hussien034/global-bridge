import React, { useState } from "react";
import { Link } from "wouter";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export default function CompaniesPage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    targetRoles: "",
    estimatedHires: "",
    message: "",
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
      const res = await api.public.submitPartnershipLead({
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        workEmail: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        country: formData.country.trim(),
        rolesNeeded: formData.targetRoles.trim(),
        hiringVolume: formData.estimatedHires || undefined,
        message: formData.message.trim() || undefined,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || t("common.error"));
      }
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div className="pill-badge" style={{ marginBottom: "14px", display: "inline-flex" }}>
          <span aria-hidden="true">🏢</span>
          <span>{t("companies.badge")}</span>
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 14px 0", color: "var(--cairo-ink)" }}>
          {t("companies.title")}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "680px", margin: "0 auto", lineHeight: 1.8 }}>
          {t("companies.intro")}
        </p>
      </div>

      {/* 3 Steps Cards */}
      <div className="cards-grid" style={{ marginBottom: "48px" }}>
        <div className="feature-card">
          <div className="card-step-badge">1. {t("companies.step1Title")}</div>
          <h3>{t("companies.step1Title")}</h3>
          <p>{t("companies.step1Description")}</p>
        </div>
        <div className="feature-card">
          <div className="card-step-badge" style={{ background: "var(--egypt-gold)", color: "#102840" }}>2. {t("companies.step2Title")}</div>
          <h3>{t("companies.step2Title")}</h3>
          <p>{t("companies.step2Description")}</p>
        </div>
        <div className="feature-card">
          <div className="card-step-badge">3. {t("companies.step3Title")}</div>
          <h3>{t("companies.step3Title")}</h3>
          <p>{t("companies.step3Description")}</p>
        </div>
      </div>

      {/* Lead Form */}
      <div className="form-card-container">
        {success ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤝</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--cairo-ink)", marginBottom: "12px" }}>
              {t("companies.successTitle")}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "500px", margin: "0 auto 24px" }}>
              {t("companies.successDescription")} <strong>{formData.email}</strong>.
            </p>
            <button onClick={() => setSuccess(false)} className="btn btn-primary">
              {t("companies.sendAnother")}
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
              {t("companies.formTitle")}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              {t("companies.formDescription")}
            </p>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", marginBottom: "20px" }}>
                ⚠️ {error}
              </div>
            )}

            <form className="application-form-shell" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("companies.companyName")} *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Nordics Tech Lab B.V."
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("companies.contact")} *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Miller"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("companies.email")} *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hiring@company.com"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("companies.phone")}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+31 20 123 4567"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>{t("companies.country")} *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder={t("companies.countryPlaceholder")}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("companies.website")}</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>{t("companies.hiringVolume")}</label>
                  <select
                    name="estimatedHires"
                    value={formData.estimatedHires}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">{t("companies.hiresPlaceholder")}</option>
                    <option value="1-2">{t("companies.hires1to2")}</option>
                    <option value="3-5">{t("companies.hires3to5")}</option>
                    <option value="6-10">{t("companies.hires6to10")}</option>
                    <option value="10+">{t("companies.hires10plus")}</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>{t("companies.roles")} *</label>
                  <input
                    type="text"
                    name="targetRoles"
                    value={formData.targetRoles}
                    onChange={handleChange}
                    placeholder={t("companies.rolesPlaceholder")}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>{t("companies.message")}</label>
                  <textarea
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t("companies.messagePlaceholder")}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-actions-bar" style={{ marginTop: "24px" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: "12px 36px", fontSize: "16px" }}
                >
                  {isSubmitting ? t("companies.submitting") : t("companies.submit")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
