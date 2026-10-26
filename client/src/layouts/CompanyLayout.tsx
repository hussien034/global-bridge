import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const menuItems = [
    { label: "لوحة التحكم الرئيسية", href: "/company/dashboard", icon: "📊" },
    { label: "الوظائف المعلنة", href: "/company/jobs", icon: "💼" },
    { label: "نشر وظيفة جديدة", href: "/company/jobs/new", icon: "➕" },
    { label: "إدارة المتقدمين (ATS)", href: "/company/applicants", icon: "👥" },
  ];

  return (
    <div className="dashboard-shell">
      {user?.isDemo && (
        <div className="dashboard-demo-banner">
          <span>⚠️ مساحة عرض تجريبية (Demo Workspace) — Northstar Labs</span>
        </div>
      )}

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <Link href="/company/dashboard">
              <Logo size="sm" />
            </Link>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="company-badge-box">
            <div className="company-avatar">
              {user?.name?.slice(0, 2).toUpperCase() ?? "NL"}
            </div>
            <div>
              <div className="company-name">{user?.companyName || user?.name || "مساحة الشركة"}</div>
              <div className="company-role">{user?.isDemo ? "Demo Partner • Company" : "Company Workspace"}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const active = location === item.href || (item.href !== "/company/dashboard" && location.startsWith(item.href));
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
              <span>العودة للموقع العام</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="dashboard-main-area">
          {/* Topbar */}
          <header className="dashboard-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
              <span className="topbar-context-title">Company Portal</span>
            </div>

            <div className="topbar-actions">
              <ThemeToggle />
              <Link href="/company/jobs/new" className="btn btn-accent" style={{ padding: "8px 16px", fontSize: "13px" }}>
                + نشر وظيفة
              </Link>
              <button
                id="company-logout-btn"
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
  );
}
