import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const accountHref = user?.role === "company"
    ? "/company/dashboard"
    : user?.role === "admin"
      ? "/admin"
      : "/candidate/profile";

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.jobs"), href: "/jobs" },
    { label: t("nav.training"), href: "/training" },
    { label: t("nav.companies"), href: "/companies" },
    { label: t("nav.about"), href: "/about" },
  ];

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    setLocation("/login");
  };

  const accountLabel = user
    ? `${user.name} · ${t(`nav.${user.role}Role`)}`
    : t("nav.login");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useScrollReveal(".public-content", location);

  return (
    <div className="site-wrapper">
      {/* Main Header */}
      <header className="navbar">
        <div className="container nav-container">
          <Link href="/" className="navbar-brand-link" aria-label={t("site.title")}>
            <Logo size="sm" className="nav-brand" />
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-links-desktop" aria-label={t("nav.home")}>
            {navLinks.map((link) => {
              const active = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link-item ${active ? "active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Tools */}
          <div className="header-actions">
            <LanguageSwitcher className="navbar-control" />
            <ThemeToggle className="navbar-control" />
            <Link
              href={user ? accountHref : "/login"}
              className="btn btn-outline navbar-login-btn"
              aria-label={accountLabel}
              title={accountLabel}
            >
              {accountLabel}
            </Link>
            {user && (
              <button type="button" className="btn btn-outline navbar-logout-btn" onClick={handleLogout}>
                {t("nav.logout")}
              </button>
            )}
            <Link href="/jobs" className="btn btn-primary navbar-apply-btn">
              {t("nav.apply")}
            </Link>
          </div>

          <button
            type="button"
            className="mobile-public-menu-btn"
            aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-public-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <div
          id="mobile-public-menu"
          className={`mobile-public-menu${mobileMenuOpen ? " is-open" : ""}`}
        >
          <nav className="mobile-public-menu-links" aria-label={t("nav.home")}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link-item ${location === link.href ? "active" : ""}`}
                aria-current={location === link.href ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-public-menu-actions">
            <LanguageSwitcher className="navbar-control" />
            <ThemeToggle className="navbar-control" />
            <Link
              href={user ? accountHref : "/login"}
              className="btn btn-outline mobile-account-link"
              aria-label={accountLabel}
              onClick={() => setMobileMenuOpen(false)}
            >
              {accountLabel}
            </Link>
            {user && (
              <button type="button" className="btn btn-outline mobile-logout-btn" onClick={handleLogout}>
                {t("nav.logout")}
              </button>
            )}
            <Link href="/jobs" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
              {t("nav.apply")}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="public-content">
        <div key={location} className="page-transition">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="container footer-grid">
          <div className="footer-col-brand">
            <Logo size="sm" />
            <p className="footer-desc">
              {t("nav.footerDescription")}
            </p>
            <div className="footer-demo-badge">
              <span>{t("nav.demoNotice")}</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t("nav.candidateLinks")}</h4>
            <ul>
              <li><Link href="/jobs">{t("nav.browseJobs")}</Link></li>
              <li><Link href="/training">{t("nav.training")}</Link></li>
              <li><Link href="/about">{t("nav.aboutGlobalBridge")}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("nav.companyLinks")}</h4>
            <ul>
              <li><Link href="/companies">{t("nav.hiringPartnerships")}</Link></li>
              <li><Link href="/company/dashboard">{t("nav.companyWorkspace")}</Link></li>
              <li><Link href="/admin">{t("nav.adminDashboard")}</Link></li>
              {user ? (
                <>
                  <li><Link href={accountHref}>{accountLabel}</Link></li>
                  <li>
                    <button type="button" className="footer-logout-link" onClick={handleLogout}>
                      {t("nav.logout")}
                    </button>
                  </li>
                </>
              ) : (
                <li><Link href="/login">{t("nav.login")}</Link></li>
              )}
            </ul>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>{t("nav.copyright")} — {t("nav.footerTrainingNote")}</p>
        </div>
      </footer>
    </div>
  );
}
