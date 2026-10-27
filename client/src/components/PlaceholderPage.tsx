import React from "react";
import { Link } from "wouter";
import { LocalizedContent } from "../i18n";

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  category?: string;
  badge?: string;
  actions?: Array<{ label: string; href?: string; onClick?: () => void; variant?: "primary" | "accent" | "outline" }>;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children?: React.ReactNode;
}

export default function PlaceholderPage({
  title,
  subtitle,
  category = "مسار تحت التطوير (Placeholder)",
  badge = "MVP Ready",
  actions = [],
  breadcrumbs = [],
  children,
}: PlaceholderPageProps) {
  return <LocalizedContent>{(
    <div className="page-shell">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <nav className="breadcrumbs-nav">
          <Link href="/">الرئيسية</Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <span className="bc-separator">/</span>
              {bc.href ? <Link href={bc.href}>{bc.label}</Link> : <span className="bc-current">{bc.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-category-badge">
            <span>{category}</span>
            {badge && <span className="demo-tag">{badge}</span>}
          </div>
          <h1 className="page-main-title">{title}</h1>
          {subtitle && <p className="page-main-subtitle">{subtitle}</p>}
        </div>

        {actions.length > 0 && (
          <div className="header-actions-group">
            {actions.map((act, idx) => (
              act.href ? (
                <Link key={idx} href={act.href} className={`btn btn-${act.variant || "primary"}`}>
                  {act.label}
                </Link>
              ) : (
                <button key={idx} onClick={act.onClick} className={`btn btn-${act.variant || "primary"}`}>
                  {act.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>

      {/* Main Content / Placeholder Body */}
      {children ? (
        children
      ) : (
        <div className="placeholder-card-container">
          <div className="placeholder-box">
            <div className="placeholder-icon">🚧</div>
            <h3>محتوى تجريبي مهيأ للمرحلة القادمة</h3>
            <p>
              تم تجهيز هذا المسار بنجاح ضمن هيكلية التوجيه العامة لمنصة Global Bridge. سيتم ربط استعلامات قاعدة البيانات وواجهات الإدخال والتعديل في المهام المخصصة لها وفق خطة العمل.
            </p>
            <div className="placeholder-meta-tags">
              <span className="meta-pill">Route Mounted</span>
              <span className="meta-pill">Responsive Shell</span>
              <span className="meta-pill">Egyptian Brand Token Styled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )}</LocalizedContent>;
}
