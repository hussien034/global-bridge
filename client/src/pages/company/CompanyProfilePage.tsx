import React, { useEffect, useState } from "react";
import { api, type CompanyProfile } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { LocalizedContent, useTranslation } from "../../i18n";

export default function CompanyProfilePage() {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    api.company.getProfile()
      .then((response) => {
        if (!response.data) throw new Error(t("companyProfile.loadError"));
        if (!active) return;
        const company = response.data;
        setProfile(company);
        setName(company.name);
        setWebsite(company.website || "");
        setCountry(company.country);
        setDescription(company.description);
        setLogoUrl(company.logoUrl || "");
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : t("companyProfile.loadError"));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [loadAttempt, t]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const response = await api.company.updateProfile({ name, website, country, description, logoUrl });
      if (!response.data) throw new Error(t("companyProfile.saveError"));
      setProfile(response.data);
      updateUserProfile(user?.name ?? "", response.data.name);
      setSuccess(t("companyProfile.saved"));
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : t("companyProfile.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return <LocalizedContent>{(
    <div className="container" style={{ padding: "32px 24px", maxWidth: 900 }}>
      <section className="feature-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <span className="demo-tag">{t("companyProfile.eyebrow")}</span>
            <h1 style={{ margin: "12px 0 8px" }}>{t("companyProfile.title")}</h1>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>{t("companyProfile.intro")}</p>
          </div>
          {profile && (
            <span className={`status-pill status-${profile.verificationStatus === "verified" ? "active" : "draft"}`}>
              {t(profile.verificationStatus === "verified" ? "companyProfile.verified" : "companyProfile.pending")}
            </span>
          )}
        </div>
      </section>

      {error && <div role="alert" className="auth-error-banner" style={{ marginBottom: 20 }}>{error}</div>}
      {success && <div role="status" className="auth-review-note" style={{ marginBottom: 20 }}>{success}</div>}

      {profile && profile.verificationStatus !== "verified" && !isLoading && (
        <div className="auth-review-note" role="status" style={{ marginBottom: 20 }}>
          <strong>{t("companyProfile.verificationTitle")}</strong>
          <span>{t("companyProfile.verificationDescription")}</span>
        </div>
      )}

      {isLoading ? (
        <section className="feature-card"><p>{t("common.loading")}</p></section>
      ) : !profile ? (
        <section className="feature-card">
          <button type="button" className="btn btn-outline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
            {t("common.retry")}
          </button>
        </section>
      ) : (
        <form className="feature-card auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <div className="auth-field">
              <label htmlFor="company-profile-name">{t("companyProfile.name")} *</label>
              <input id="company-profile-name" className="input-field" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={200} />
            </div>
            <div className="auth-field">
              <label htmlFor="company-profile-country">{t("companyProfile.country")} *</label>
              <input id="company-profile-country" className="input-field" value={country} onChange={(event) => setCountry(event.target.value)} required minLength={2} maxLength={120} />
            </div>
            <div className="auth-field">
              <label htmlFor="company-profile-website">{t("companyProfile.website")}</label>
              <input id="company-profile-website" className="input-field" type="url" placeholder="https://company.com" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </div>
            <div className="auth-field">
              <label htmlFor="company-profile-logo">{t("companyProfile.logoUrl")}</label>
              <input id="company-profile-logo" className="input-field" type="url" placeholder="https://company.com/logo.png" value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
            </div>
            <div className="auth-field profile-field-full">
              <label htmlFor="company-profile-description">{t("companyProfile.description")} *</label>
              <textarea id="company-profile-description" className="input-field" value={description} onChange={(event) => setDescription(event.target.value)} required minLength={10} maxLength={2000} rows={6} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={isSaving}>
            {isSaving ? t("companyProfile.saving") : t("companyProfile.save")}
          </button>
        </form>
      )}
    </div>
  )}</LocalizedContent>;
}
