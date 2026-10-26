import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

const ROLE_REDIRECT: Record<string, string> = {
  company: "/company/dashboard",
  admin: "/admin",
  candidate: "/jobs",
};

type RegistrationRole = "candidate" | "company" | "admin";

export default function LoginPage() {
  const { login, register, user } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole>("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [rolesNeeded, setRolesNeeded] = useState("");
  const [reason, setReason] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  if (user) {
    const dest = ROLE_REDIRECT[user.role] ?? "/";
    setLocation(dest);
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
        const result = await register(name.trim(), email.trim(), password);
        if (!result.success) {
          setError(result.error || t("common.error"));
          return;
        }
        setLocation(ROLE_REDIRECT[result.role || "candidate"]);
        return;
      }

      if (registrationRole === "company") {
        await api.public.submitPartnershipLead({
          companyName: companyName.trim(),
          contactPerson: name.trim(),
          workEmail: email.trim(),
          website: website.trim() || undefined,
          country: country.trim(),
          rolesNeeded: rolesNeeded.trim(),
          message: t("auth.companyRequestMessage"),
        });
      } else {
        await api.public.submitAdminAccessRequest({
          name: name.trim(),
          email: email.trim(),
          reason: reason.trim(),
        });
      }
      setRequestSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: "960px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            borderRadius: "100px",
            padding: "6px 16px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          <span>🔐</span>
          <span>{t("auth.badge")}</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            color: "var(--cairo-ink)",
            marginBottom: "12px",
          }}
        >
          {t("auth.title")}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", maxWidth: "480px", margin: "0 auto" }}>
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
            onClick={() => { setMode("register"); setError(null); setRequestSubmitted(false); }}
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
              <button type="button" className={`auth-role-choice${registrationRole === "candidate" ? " active" : ""}`} aria-pressed={registrationRole === "candidate"} onClick={() => { setRegistrationRole("candidate"); setError(null); setRequestSubmitted(false); }}>
                <span className="auth-role-icon">👤</span>
                <span><strong>{t("auth.candidate")}</strong><small>{t("auth.candidateDescription")}</small></span>
              </button>
              <button type="button" className={`auth-role-choice${registrationRole === "company" ? " active" : ""}`} aria-pressed={registrationRole === "company"} onClick={() => { setRegistrationRole("company"); setError(null); setRequestSubmitted(false); }}>
                <span className="auth-role-icon">🏢</span>
                <span><strong>{t("auth.company")}</strong><small>{t("auth.companyDescription")}</small></span>
              </button>
              <button type="button" className={`auth-role-choice${registrationRole === "admin" ? " active" : ""}`} aria-pressed={registrationRole === "admin"} onClick={() => { setRegistrationRole("admin"); setError(null); setRequestSubmitted(false); }}>
                <span className="auth-role-icon">🛡️</span>
                <span><strong>{t("auth.admin")}</strong><small>{t("auth.adminDescription")}</small></span>
              </button>
            </div>
          </>
        )}

        {requestSubmitted ? (
          <div className="auth-request-success" role="status">
            <span className="auth-success-icon">✓</span>
            <h2>{registrationRole === "company" ? t("auth.requestReceivedCompany") : t("auth.requestReceivedAdmin")}</h2>
            <p>
              {registrationRole === "company"
                ? t("auth.companyReceivedMessage", { company: companyName, email })
                : t("auth.adminReceivedMessage", { email })}
            </p>
            <button type="button" className="btn btn-outline" onClick={() => { setMode("login"); setRequestSubmitted(false); }}>
              {t("auth.backToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="auth-form-section-title">
                <h2>{registrationRole === "candidate" ? t("auth.candidateForm") : registrationRole === "company" ? t("auth.companyForm") : t("auth.adminForm")}</h2>
                <p>{registrationRole === "candidate" ? t("auth.candidateFormDescription") : t("auth.reviewFormDescription")}</p>
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
                <div className="auth-field">
                  <label htmlFor="auth-roles">{t("auth.roles")} *</label>
                  <input id="auth-roles" required minLength={2} placeholder="Backend, Frontend, DevOps" value={rolesNeeded} onChange={(event) => setRolesNeeded(event.target.value)} className="input-field" />
                </div>
              </div>
            )}

            {mode === "register" && registrationRole !== "company" && (
              <div className="auth-field">
                <label htmlFor="auth-name">{t("auth.name")} *</label>
                <input id="auth-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="input-field" />
              </div>
            )}

            {(mode === "login" || (mode === "register" && registrationRole !== "company")) && (
              <div className="auth-field">
                <label htmlFor="auth-email">{t(mode === "register" && registrationRole === "company" ? "auth.workEmail" : "auth.email")} *</label>
                <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" />
              </div>
            )}

            {mode === "login" && (
              <div className="auth-field">
                <label htmlFor="auth-password">{t("auth.password")} *</label>
                <input id="auth-password" type="password" autoComplete="current-password" required minLength={1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" />
              </div>
            )}

            {mode === "register" && registrationRole === "candidate" && (
              <>
                <div className="auth-field">
                  <label htmlFor="auth-password">{t("auth.password")} *</label>
                  <input id="auth-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="input-field" />
                  <small>{t("auth.passwordHint")}</small>
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-confirm-password">{t("auth.confirmPassword")} *</label>
                  <input id="auth-confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input-field" />
                </div>
              </>
            )}

            {mode === "register" && registrationRole === "admin" && (
              <div className="auth-field">
                <label htmlFor="auth-reason">{t("auth.reason")} *</label>
                <textarea id="auth-reason" required minLength={20} maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="input-field" placeholder={t("auth.reasonPlaceholder")} />
                <small>{t("auth.reasonHint")}</small>
              </div>
            )}

            {mode === "register" && registrationRole !== "candidate" && (
              <div className="auth-review-note" role="note">
                <strong>{t("auth.reviewTitle")}</strong>
                <span>{registrationRole === "company"
                  ? t("auth.companyReview")
                  : t("auth.adminReview")}</span>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary auth-submit">
              {isSubmitting ? t("auth.submitting") : mode === "login"
                ? t("auth.login")
                : registrationRole === "candidate"
                  ? t("auth.createCandidate")
                  : registrationRole === "company"
                    ? t("auth.submitCompany")
                    : t("auth.submitAdmin")}
            </button>
          </form>
        )}
      </section>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "24px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

    </div>
  );
}
