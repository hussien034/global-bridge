import type { Request, Response, NextFunction } from "express";

// ==========================================
// Session Types
// ==========================================

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "candidate" | "company" | "admin";
  companyId: number | null;
  companyName: string | null;
  isDemo: boolean;
  profileComplete: boolean;
}

// Extend Express Request to carry session user
declare global {
  namespace Express {
    interface Request {
      sessionUser?: SessionUser;
    }
  }
}

// ==========================================
// In-Memory Session Store (MVP Demo)
// Key: session token → Value: SessionUser
// ==========================================
export const sessionStore = new Map<string, SessionUser>();

// ==========================================
// Middleware: Parse session from header or cookie
// ==========================================
export function sessionMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token =
    req.headers["x-session-token"] as string | undefined ||
    parseCookieToken(req.headers.cookie);

  if (token && sessionStore.has(token)) {
    req.sessionUser = sessionStore.get(token);
  }
  next();
}

function parseCookieToken(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/gb_session=([^;]+)/);
  return match ? match[1] : undefined;
}

// ==========================================
// Middleware: Require authenticated session
// ==========================================
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.sessionUser) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Please log in to access this resource.",
    });
  }
  next();
}

// ==========================================
// Middleware: Require specific role(s)
// ==========================================
export function requireRole(...roles: Array<"candidate" | "company" | "admin">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.sessionUser) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }
    if (!roles.includes(req.sessionUser.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. This action requires one of: [${roles.join(", ")}].`,
      });
    }
    next();
  };
}

// ==========================================
// Middleware: Require admin role
// ==========================================
export const requireAdmin = requireRole("admin");

// ==========================================
// Middleware: Require company role + ownership
// Checks that req.sessionUser.companyId matches
// the companyId param or body field.
// ==========================================
export function requireCompanyOwnership(
  getCompanyId: (req: Request) => number | null | undefined
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.sessionUser) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }
    if (req.sessionUser.role === "admin") {
      // Admins always pass ownership check
      return next();
    }
    if (req.sessionUser.role !== "company") {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }
    const targetCompanyId = getCompanyId(req);
    if (targetCompanyId !== null && targetCompanyId !== undefined &&
        req.sessionUser.companyId !== targetCompanyId) {
      return res.status(403).json({
        success: false,
        error: "Forbidden. You can only access resources belonging to your company.",
      });
    }
    next();
  };
}
