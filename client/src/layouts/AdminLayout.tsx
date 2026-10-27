import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { LocalizedContent } from "../i18n";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  useScrollReveal(".dashboard-content-inner", location);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const adminNavItems = [
    { label: "لوحة التحكم الشاملة", href: "/admin", icon: "📈" },
    { label: "طلبات التسجيل والصلاحيات", href: "/admin/registration-requests", icon: "📝" },
    { label: "الشركات والشركاء", href: "/admin/companies", icon: "🏢" },
    { label: "الوظائف المفتوحة", href: "/admin/jobs", icon: "📑" },
    { label: "طلبات المتقدمين", href: "/admin/applicants", icon: "👤" },
    { label: "البرامج التدريبية", href: "/admin/training", icon: "🎓" },
    { label: "سجل الأنشطة والمتابعة", href: "/admin/activity", icon: "⚡" },
  ];

  return <LocalizedContent>{(
    <div className="dashboard-shell admin-theme">
      {/* Required Admin Demo Banner */}
      <div className="dashboard-demo-banner admin-banner">
        <span>🛡️ Admin Workspace — إدارة المنصة</span>
      </div>

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <Link href="/admin">
              <Logo size="sm" />
            </Link>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="admin-badge-box">
            <div className="admin-avatar">👑</div>
            <div>
              <div className="company-name">{user?.name ?? "Platform Administrator"}</div>
              <div className="company-role">Super Admin • All Roles Access</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {adminNavItems.map((item) => {
              const active = item.href === "/admin" ? location === "/admin" : location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item ${active ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <Link href="/" className="sidebar-nav-item return-link">
              <span className="sidebar-icon">🌐</span>
              <span>الموقع العام للزوار</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="dashboard-main-area">
          {/* Topbar */}
          <header className="dashboard-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
              <span className="topbar-context-title">Admin Management Portal</span>
            </div>

            <div className="topbar-actions">
              <ThemeToggle />
              <Link href="/company/dashboard" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: "13px" }}>
                معاينة لوحة الشركة
              </Link>
              <button
                id="admin-logout-btn"
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}
              >
                تسجيل الخروج
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="dashboard-content-inner">
            <div key={location} className="page-transition">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}</LocalizedContent>;
}
