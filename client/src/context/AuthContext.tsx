import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ==========================================
// Types
// ==========================================

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "candidate" | "company" | "admin";
  companyId: number | null;
  companyName: string | null;
  isDemo: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }>;
  logout: () => Promise<void>;
  hasRole: (...roles: AuthUser["role"][]) => boolean;
}

// ==========================================
// Context
// ==========================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ==========================================
// Provider
// ==========================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gb_token");
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("gb_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    // Verify token with backend
    fetch("/api/auth/session", {
      headers: { "x-session-token": storedToken },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token expired/invalid
          localStorage.removeItem("gb_token");
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("gb_token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ----------------------------------------
  // login
  // ----------------------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem("gb_token", data.token);
          return { success: true, role: data.user.role };
        }
        return { success: false, error: data.error ?? "فشل تسجيل الدخول." };
      } catch {
        return { success: false, error: "تعذّر الاتصال بالسيرفر." };
      }
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem("gb_token", data.token);
          return { success: true, role: data.user.role };
        }
        return { success: false, error: data.error ?? "تعذّر إنشاء الحساب." };
      } catch {
        return { success: false, error: "تعذّر الاتصال بالسيرفر." };
      }
    },
    []
  );

  // ----------------------------------------
  // logout
  // ----------------------------------------
  const logout = useCallback(async () => {
    const storedToken = localStorage.getItem("gb_token");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: storedToken ? { "x-session-token": storedToken } : {},
        credentials: "include",
      });
    } catch {
      // silent
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("gb_token");
  }, []);

  // ----------------------------------------
  // hasRole
  // ----------------------------------------
  const hasRole = useCallback(
    (...roles: AuthUser["role"][]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// Hook
// ==========================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
