import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n";

const ROLE_REDIRECT: Record<string, string> = {
  company: "/company/dashboard",
  admin: "/admin",
  candidate: "/candidate/profile",
};

type RegistrationRole = "candidate" | "company";

export default function LoginPage() {
  const { login, register, registerCompany, user } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole>("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const dest = ROLE_REDIRECT[user.role] ?? "/";
    setLocation(dest);
  }, [setLocation, user]);

  if (user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await login(email.trim(), password);
        if (!result.success) {
          setError(result.error || t("common.error"));
          return;
        }
        setLocation(ROLE_REDIRECT[result.role || "candidate"]);
        return;
      }

      if (registrationRole === "candidate") {
        if (password !== confirmPassword) {
          setError(t("auth.passwordMismatch"));
          return;
        }
        if (!photoFile) {
          setError(t("profile.photoRequired"));
          return;
        }
        const result = await register(name.trim(), email.trim(), password, photoFile);
        if (!result.success) {
          setError(result.error || t("common.error"));
          return;
        }
        setLocation(ROLE_REDIRECT[result.role || "candidate"]);
        return;
      }

      if (password !== confirmPassword) {
        setError(t("auth.passwordMismatch"));
        return;
      }

      const result = await registerCompany({
        contactName: name.trim(),
        email: email.trim(),
        password,
        companyName: companyName.trim(),
        website: website.trim() || undefined,
        country: country.trim(),
        description: companyDescription.trim(),
      });
      if (!result.success) {
        setError(result.error || t("common.error"));
        return;
      }
      setLocation(ROLE_REDIRECT[result.role || "company"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setError(t("profile.photoTypeError"));
      event.currentTarget.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setError(t("profile.photoSizeError"));
      event.currentTarget.value = "";
      return;
    }
    setError(null);
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoPreview(reader.result);
    };
    reader.onerror = () => setError(t("profile.photoReadError"));
    reader.readAsDataURL(file);
  };

  return (
    <div className="container auth-page-container">
      {/* Header */}
      <div className="auth-page-header">
        <div
          className="auth-page-badge"
        >
          <span aria-hidden="true">✦</span>
          <span>{t("auth.badge")}</span>
        </div>
        <h1>
          {t("auth.title")}
        </h1>
        <p>
          {t("auth.intro")}
        </p>
      </div>

      <section className="feature-card auth-card">
        <div className="auth-mode-switch">
          <button
            type="button"
            className={mode === "login" ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => { setMode("login"); setError(null); }}
            aria-pressed={mode === "login"}
          >
            {t("auth.login")}
          </button>
          <button
            type="button"
            className={mode === "register" ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => { setMode("register"); setError(null); }}
            aria-pressed={mode === "register"}
          >
            {t("auth.register")}
          </button>
        </div>
        {mode === "register" && (
          <>
            <div className="auth-role-heading">
              <h2>{t("auth.chooseRole")}</h2>
              <p>{t("auth.roleIntro")}</p>
            </div>
            <div className="auth-role-options">
              <button type="button" className={`auth-role-choice${registrationRole === "candidate" ? " active" : ""}`} aria-pressed={registrationRole === "candidate"} onClick={() => { setRegistrationRole("candidate"); setError(null); }}>
                <span className="auth-role-icon">👤</span>
                <span><strong>{t("auth.candidate")}</strong><small>{t("auth.candidateDescription")}</small></span>
              </button>
              <button type="button" className={`auth-role-choice${registrationRole === "company" ? " active" : ""}`} aria-pressed={registrationRole === "company"} onClick={() => { setRegistrationRole("company"); setError(null); }}>
                <span className="auth-role-icon">🏢</span>
                <span><strong>{t("auth.company")}</strong><small>{t("auth.companyDescription")}</small></span>
              </button>
            </div>
            <div className="auth-review-note" role="note">
              <strong>{t("auth.adminProvisioningTitle")}</strong>
              <span>{t("auth.adminProvisioningDescription")}</span>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="auth-form-section-title">
                <h2>{registrationRole === "candidate" ? t("auth.candidateForm") : t("auth.companyForm")}</h2>
                <p>{registrationRole === "candidate" ? t("auth.candidateFormDescription") : t("auth.companyFormDescription")}</p>
              </div>
            )}

            {mode === "register" && registrationRole === "company" && (
              <div className="auth-form-grid">
                <div className="auth-field">
                  <label htmlFor="auth-company">{t("auth.companyName")} *</label>
                  <input id="auth-company" autoComplete="organization" required minLength={2} maxLength={200} value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="input-field" />
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-name">{t("auth.contact")} *</label>
                  <input id="auth-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="input-field" />
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-email">{t("auth.workEmail")} *</label>
                  <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" />
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-company-website">{t("auth.website")}</label>
                  <input id="auth-company-website" type="url" autoComplete="url" placeholder="https://company.com" value={website} onChange={(event) => setWebsite(event.target.value)} className="input-field" />
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-country">{t("auth.country")} *</label>
                  <input id="auth-country" autoComplete="country-name" required minLength={2} value={country} onChange={(event) => setCountry(event.target.value)} className="input-field" />
                </div>
                <div className="auth-field profile-field-full">
                  <label htmlFor="auth-company-description">{t("auth.companyProfileDescription")} *</label>
                  <textarea id="auth-company-description" required minLength={10} maxLength={2000} rows={4} value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} className="input-field" placeholder={t("auth.companyProfileDescriptionHint")} />
                </div>
              </div>
            )}

            {mode === "register" && registrationRole === "candidate" && (
              <div className="auth-field">
                <label htmlFor="auth-name">{t("auth.name")} *</label>
                <input id="auth-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="input-field" />
              </div>
            )}

            {(mode === "login" || (mode === "register" && registrationRole === "candidate")) && (
              <div className="auth-field">
                <label htmlFor="auth-email">{t("auth.email")} *</label>
                <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" />
              </div>
            )}

            {mode === "login" && (
              <div className="auth-field">
                <label htmlFor="auth-password">{t("auth.password")} *</label>
                <div className="auth-password-control">
                  <input id="auth-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}>{showPassword ? "◉" : "◎"}</button>
                </div>
              </div>
            )}

            {mode === "register" && registrationRole === "candidate" && (
              <>
                <div className="auth-photo-upload">
                  <div className="auth-photo-preview">
                    {photoPreview
                      ? <img src={photoPreview} alt={t("profile.photoPreview")} />
                      : <span aria-hidden="true">{name.trim().charAt(0) || "👤"}</span>}
                  </div>
                  <div className="auth-photo-field">
                    <label htmlFor="auth-photo">{t("profile.photo")} *</label>
                    <input
                      id="auth-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      onChange={handlePhotoChange}
                      className="input-field"
                    />
                    <small>{t("profile.photoFormats")}</small>
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-password">{t("auth.password")} *</label>
                  <div className="auth-password-control">
                    <input id="auth-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}>{showPassword ? "◉" : "◎"}</button>
                  </div>
                  <small>{t("auth.passwordHint")}</small>
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-confirm-password">{t("auth.confirmPassword")} *</label>
                  <input id="auth-confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input-field" />
                </div>
              </>
            )}

            {mode === "register" && registrationRole === "company" && (
              <>
                <div className="auth-field">
                  <label htmlFor="auth-password">{t("auth.password")} *</label>
                  <div className="auth-password-control">
                    <input id="auth-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" />
                    <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}>{showPassword ? "◉" : "◎"}</button>
                  </div>
                  <small>{t("auth.passwordHint")}</small>
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-confirm-password">{t("auth.confirmPassword")} *</label>
                  <input id="auth-confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input-field" />
                </div>
                <div className="auth-review-note" role="note">
                  <strong>{t("auth.companyVerificationTitle")}</strong>
                  <span>{t("auth.companyVerificationDescription")}</span>
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary auth-submit">
              {isSubmitting ? t("auth.submitting") : mode === "login"
                ? t("auth.login")
                : registrationRole === "candidate"
                  ? t("auth.createCandidate")
                  : t("auth.createCompanyAccount")}
            </button>
          </form>
      </section>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="auth-error-banner"
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

    </div>
  );
}
