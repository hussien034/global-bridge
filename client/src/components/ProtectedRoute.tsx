import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Required role(s) — if not met, redirect to /login */
  roles: AuthUser["role"][];
  /** Where to redirect unauthorized users. Defaults to /login */
  redirectTo?: string;
}

/**
 * Wraps a route and enforces role-based access.
 * - If session is still loading, renders a spinner.
 * - If user is not authenticated, redirects to /login.
 * - If user doesn't have the required role, redirects to / (public).
 */
export default function ProtectedRoute({
  children,
  roles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Still verifying session
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--border-color)",
            borderTopColor: "var(--nile-blue)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>جارٍ التحقق من الجلسة…</p>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!user) {
    setLocation(redirectTo);
    return null;
  }

  // Authenticated but wrong role → redirect to public home
  if (!roles.includes(user.role)) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}
