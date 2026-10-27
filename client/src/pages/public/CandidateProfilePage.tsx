import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { api, type CandidateProfile } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n";

type ProfileForm = Omit<CandidateProfile, "email" | "profileComplete" | "photoUrl">;

const EMPTY_PROFILE: ProfileForm = {
  name: "",
  phone: "",
  headline: "",
  location: "",
  bio: "",
  skills: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
};

async function encodeImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Could not read the selected photo."));
    reader.onerror = () => reject(new Error("Could not read the selected photo."));
    reader.readAsDataURL(file);
  });
  return dataUrl.split(",")[1] ?? "";
}

export default function CandidateProfilePage() {
  const { updateUserProfile } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    api.auth.getProfile()
      .then((response) => {
        if (!active || !response.data) return;
        const profile = response.data;
        setForm({
          name: profile.name,
          phone: profile.phone,
          headline: profile.headline,
          location: profile.location,
          bio: profile.bio,
          skills: profile.skills,
          linkedinUrl: profile.linkedinUrl,
          githubUrl: profile.githubUrl,
          portfolioUrl: profile.portfolioUrl,
        });
        const savedPhotoUrl = profile.photoUrl;
        setPhotoUrl(savedPhotoUrl);
        setHasPhoto(Boolean(savedPhotoUrl));
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : t("common.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [t]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const previewUrl = photoPreview || photoUrl;

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setError(null);
    setSaved(false);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(t("profile.photoTypeError"));
      event.currentTarget.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(t("profile.photoSizeError"));
      event.currentTarget.value = "";
      return;
    }
    setPhotoFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const photoData = photoFile ? await encodeImage(photoFile) : undefined;
      await api.auth.updateProfile({
        ...form,
        ...(photoFile && photoData
          ? { photoFile: { name: photoFile.name, mimeType: photoFile.type, data: photoData } }
          : {}),
      });
      if (photoFile) {
        setPhotoUrl("/api/auth/profile/photo?updated=" + Date.now());
        setHasPhoto(true);
        setPhotoFile(null);
      }
      updateUserProfile(form.name);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container profile-page"><p role="status">{t("common.loading")}</p></div>;
  }

  return (
    <div className="container profile-page">
      <header className="profile-page-header">
        <div>
          <Link className="profile-back-link" href="/jobs">{t("profile.backToJobs")}</Link>
          <p className="profile-eyebrow">{t("profile.eyebrow")}</p>
          <h1>{t("profile.title")}</h1>
          <p>{t("profile.intro")}</p>
        </div>
        <div className="profile-completion-badge">{t(hasPhoto ? "profile.photoReady" : "profile.requiredPhoto")}</div>
      </header>

      <form className="profile-form feature-card" onSubmit={handleSubmit}>
        <section className="profile-photo-section">
          <div className="profile-photo-preview" aria-label={t("profile.photo")}>
            {previewUrl
              ? <img src={previewUrl} alt={t("profile.photo")} />
              : <span aria-hidden="true">{form.name.trim().charAt(0) || "?"}</span>}
          </div>
          <div className="profile-photo-copy">
            <h2>{t("profile.photo")}</h2>
            <p>{t("profile.photoHint")}</p>
            <label className="btn btn-outline profile-photo-button" htmlFor="candidate-photo">
              {photoFile ? t("profile.changePhoto") : t("profile.uploadPhoto")}
            </label>
            <input
              id="candidate-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              aria-describedby="candidate-photo-hint"
            />
            <small id="candidate-photo-hint">{t("profile.photoFormats")}</small>
          </div>
        </section>

        <section className="profile-fields-section">
          <div className="profile-section-heading">
            <h2>{t("profile.personalDetails")}</h2>
            <p>{t("profile.personalDetailsHint")}</p>
          </div>
          <div className="profile-fields-grid">
            <div className="auth-field">
              <label htmlFor="profile-name">{t("auth.name")} *</label>
              <input id="profile-name" className="input-field" required minLength={2} maxLength={100} value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </div>
            <div className="auth-field">
              <label htmlFor="profile-headline">{t("profile.headline")}</label>
              <input id="profile-headline" className="input-field" maxLength={120} value={form.headline} onChange={(event) => updateField("headline", event.target.value)} placeholder={t("profile.headlinePlaceholder")} />
            </div>
            <div className="auth-field">
              <label htmlFor="profile-phone">{t("profile.phone")}</label>
              <input id="profile-phone" className="input-field" type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </div>
            <div className="auth-field">
              <label htmlFor="profile-location">{t("profile.location")}</label>
              <input id="profile-location" className="input-field" autoComplete="address-level2" maxLength={120} value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </div>
            <div className="auth-field profile-field-full">
              <label htmlFor="profile-bio">{t("profile.bio")}</label>
              <textarea id="profile-bio" className="input-field" rows={5} maxLength={2000} value={form.bio} onChange={(event) => updateField("bio", event.target.value)} placeholder={t("profile.bioPlaceholder")} />
              <small>{form.bio.length}/2000</small>
            </div>
            <div className="auth-field profile-field-full">
              <label htmlFor="profile-skills">{t("profile.skills")}</label>
              <input id="profile-skills" className="input-field" maxLength={1000} value={form.skills} onChange={(event) => updateField("skills", event.target.value)} placeholder={t("profile.skillsPlaceholder")} />
            </div>
          </div>
        </section>

        <section className="profile-fields-section">
          <div className="profile-section-heading">
            <h2>{t("profile.professionalLinks")}</h2>
            <p>{t("profile.professionalLinksHint")}</p>
          </div>
          <div className="profile-fields-grid">
            <div className="auth-field">
              <label htmlFor="profile-linkedin">LinkedIn</label>
              <input id="profile-linkedin" className="input-field" type="url" maxLength={500} value={form.linkedinUrl} onChange={(event) => updateField("linkedinUrl", event.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="auth-field">
              <label htmlFor="profile-github">GitHub</label>
              <input id="profile-github" className="input-field" type="url" maxLength={500} value={form.githubUrl} onChange={(event) => updateField("githubUrl", event.target.value)} placeholder="https://github.com/..." />
            </div>
            <div className="auth-field profile-field-full">
              <label htmlFor="profile-portfolio">{t("profile.portfolio")}</label>
              <input id="profile-portfolio" className="input-field" type="url" maxLength={500} value={form.portfolioUrl} onChange={(event) => updateField("portfolioUrl", event.target.value)} placeholder="https://" />
            </div>
          </div>
        </section>

        {error && <div className="auth-error-banner" role="alert">{error}</div>}
        {saved && <div className="profile-saved-banner" role="status">{t("profile.saved")}</div>}
        <div className="profile-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || (!photoUrl && !photoFile)}>
            {saving ? t("profile.saving") : t("profile.save")}
          </button>
          <Link className="btn btn-outline" href="/jobs">{t("profile.browseJobs")}</Link>
        </div>
      </form>
    </div>
  );
}
