import { Router } from "express";
import { randomBytes } from "crypto";
import { db } from "../db";
import { companies, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sessionStore, requireAuth } from "../middleware/auth.middleware";
import type { SessionUser } from "../middleware/auth.middleware";
import { registerCandidateSchema } from "@shared/validators";
import { hashPassword, verifyPassword } from "../auth/password";
import { ZodError } from "zod";

export const authRouter = Router();

// ==========================================
// Demo Accounts — seeded in DB by seed.ts
// ==========================================
const DEMO_CREDENTIALS: Record<string, string> = {
  "demo-company@globalbridge.dev": "demo-company",
  "demo-admin@globalbridge.dev":   "demo-admin",
  "demo-candidate@globalbridge.dev": "demo-candidate",
};

// Session token TTL (24h in ms)
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function createSession(
  res: import("express").Response,
  sessionUser: SessionUser,
  statusCode = 200
) {
  const token = randomBytes(32).toString("hex");
  sessionStore.set(token, sessionUser);

  const expiry = setTimeout(() => sessionStore.delete(token), SESSION_TTL_MS);
  expiry.unref();

  res
    .cookie("gb_session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_TTL_MS,
      secure: process.env.NODE_ENV === "production",
    })
    .status(statusCode)
    .json({
      success: true,
      token,
      user: sessionUser,
    });
}

// ==========================================
// POST /api/auth/register — candidate self-registration only
// ==========================================
authRouter.post("/register", async (req, res) => {
  try {
    const input = registerCandidateSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const passwordHash = await hashPassword(input.password);
    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email,
        passwordHash,
        role: "candidate",
        companyId: null,
      })
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (!newUser) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const sessionUser: SessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: "candidate",
      companyId: null,
      companyName: null,
      isDemo: false,
    };
    createSession(res, sessionUser, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || "Invalid registration details.",
      });
    }
    console.error("[Auth] Candidate registration error:", error);
    res.status(500).json({ success: false, error: "Unable to create your account right now." });
  }
});

// ==========================================
// POST /api/auth/login
// Body: { email, password }
// ==========================================
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Demo credentials remain available for the seeded preview accounts.
    const expectedPassword = DEMO_CREDENTIALS[normalizedEmail];
    const [dbUser] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    const isDemoLogin =
      process.env.NODE_ENV !== "production" && expectedPassword === password;
    const isValidPassword = isDemoLogin ||
      (!!dbUser?.passwordHash && await verifyPassword(password, dbUser.passwordHash));
    if (!dbUser || !isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password.",
      });
    }

    let companyName: string | null = null;
    if (dbUser.role === "company" && dbUser.companyId) {
      const [company] = await db
        .select({ status: companies.status, name: companies.name })
        .from(companies)
        .where(eq(companies.id, dbUser.companyId))
        .limit(1);
      if (!company || company.status !== "active") {
        return res.status(403).json({ success: false, error: "This company account is not active." });
      }
      companyName = company.name;
    }

    // Build session
    const sessionUser: SessionUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role as "candidate" | "company" | "admin",
      companyId: dbUser.companyId ?? null,
      companyName,
      isDemo: isDemoLogin,
    };

    console.log(`[Auth] Login success: ${sessionUser.email} (role: ${sessionUser.role})`);
    createSession(res, sessionUser);
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// ==========================================
// POST /api/auth/logout
// ==========================================
authRouter.post("/logout", (req, res) => {
  const token =
    (req.headers["x-session-token"] as string | undefined) ||
    parseCookieToken(req.headers.cookie);

  if (token) {
    sessionStore.delete(token);
  }

  res
    .clearCookie("gb_session")
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
});

// ==========================================
// GET /api/auth/session  — current user
// ==========================================
authRouter.get("/session", requireAuth, (req, res) => {
  const user = req.sessionUser!;
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName,
      isDemo: user.isDemo,
    },
  });
});

// ==========================================
// GET /api/auth/demo-accounts — list demo credentials for UI
// ==========================================
authRouter.get("/demo-accounts", (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ success: false, error: "Not found." });
  }
  res.status(200).json({
    success: true,
    accounts: [
      {
        role: "company",
        email: "demo-company@globalbridge.dev",
        password: "demo-company",
        label: "Northstar Labs — Demo Partner",
        description: "إدارة الوظائف والمتقدمين وتغيير حالات الطلبات.",
        icon: "🏢",
      },
      {
        role: "admin",
        email: "demo-admin@globalbridge.dev",
        password: "demo-admin",
        label: "Admin Workspace — مدير المنصة",
        description: "إشراف كامل على كل بيانات المنصة وإحصائياتها.",
        icon: "👑",
      },
      {
        role: "candidate",
        email: "demo-candidate@globalbridge.dev",
        password: "demo-candidate",
        label: "Candidate — مرشح تقني",
        description: "تصفح الوظائف والتدريبات (بدون لوحة تحكم).",
        icon: "👤",
      },
    ],
  });
});

// ==========================================
// Helpers
// ==========================================
function parseCookieToken(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(/gb_session=([^;]+)/);
  return match ? match[1] : undefined;
}
