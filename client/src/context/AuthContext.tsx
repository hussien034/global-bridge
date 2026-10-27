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
  profileComplete: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }>;
  register: (name: string, email: string, password: string, photoFile: File) => Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }>;
  registerCompany: (input: { contactName: string; email: string; password: string; companyName: string; website?: string; country: string; description: string }) => Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }>;
  updateUserProfile: (name: string, companyName?: string) => void;
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
    async (name: string, email: string, password: string, photoFile: File): Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }> => {
      try {
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== "string") {
              reject(new Error("Could not read the selected photo."));
              return;
            }
            resolve(reader.result.split(",")[1] ?? "");
          };
          reader.onerror = () => reject(new Error("Could not read the selected photo."));
          reader.readAsDataURL(photoFile);
        });
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            password,
            photoFile: { name: photoFile.name, mimeType: photoFile.type, data: fileData },
          }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem("gb_token", data.token);
          return { success: true, role: data.user.role };
        }
        return { success: false, error: data.error ?? "تعذّر إنشاء الحساب." };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "تعذّر إنشاء الحساب." };
      }
    },
    []
  );

  const updateUserProfile = useCallback((name: string, companyName?: string) => {
    setUser((currentUser) => currentUser
      ? { ...currentUser, name, ...(companyName ? { companyName } : {}), profileComplete: true }
      : currentUser);
  }, []);

  const registerCompany = useCallback(async (input: {
    contactName: string;
    email: string;
    password: string;
    companyName: string;
    website?: string;
    country: string;
    description: string;
  }): Promise<{ success: boolean; error?: string; role?: AuthUser["role"] }> => {
    try {
      const res = await fetch("/api/auth/register/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error ?? "Unable to create the company account." };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("gb_token", data.token);
      return { success: true, role: data.user.role };
    } catch {
      return { success: false, error: "Could not connect to the server." };
    }
  }, []);

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
        registerCompany,
        updateUserProfile,
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
