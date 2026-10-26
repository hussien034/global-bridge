import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "../i18n";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.jobs"), href: "/jobs" },
    { label: t("nav.training"), href: "/training" },
    { label: t("nav.companies"), href: "/companies" },
    { label: t("nav.about"), href: "/about" },
  ];

  return (
    <div className="site-wrapper">
      {/* Main Header */}
      <header className="navbar">
        <div className="container nav-container">
          <Link href="/">
            <Logo size="sm" />
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
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login" className="btn btn-outline navbar-login-btn">
              {t("nav.login")}
            </Link>
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
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
              {t("nav.login")}
            </Link>
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
              <li><Link href="/login">{t("nav.login")}</Link></li>
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
