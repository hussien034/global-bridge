import { Router } from "express";
import { randomBytes } from "crypto";
import { db } from "../db";
import { companies, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sessionStore, requireAuth, requireRole } from "../middleware/auth.middleware";
import type { SessionUser } from "../middleware/auth.middleware";
import { candidateProfileSchema, registerCandidateSchema, registerCompanySchema } from "@shared/validators";
import { hashPassword, verifyPassword } from "../auth/password";
import { ZodError } from "zod";
import {
  deleteProfilePhoto,
  ProfilePhotoUploadError,
  readProfilePhoto,
  saveProfilePhoto,
} from "../services/profile-photo-storage";

export const authRouter = Router();

class RegistrationEmailConflict extends Error {}

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
  let photoKey: string | undefined;
  let userCreated = false;
  try {
    const input = registerCandidateSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const savedPhoto = await saveProfilePhoto(input.photoFile.mimeType, input.photoFile.data);
    photoKey = savedPhoto.storageKey;
    const passwordHash = await hashPassword(input.password);
    const [newUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email,
        passwordHash,
        profilePhotoKey: photoKey,
        role: "candidate",
        companyId: null,
      })
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (!newUser) {
      try {
        await deleteProfilePhoto(photoKey);
      } catch (cleanupError) {
        console.error("[Auth] Failed to remove a duplicate registration photo:", cleanupError);
      }
      photoKey = undefined;
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }
    userCreated = true;

    const sessionUser: SessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: "candidate",
      companyId: null,
      companyName: null,
      isDemo: false,
      profileComplete: true,
    };
    createSession(res, sessionUser, 201);
  } catch (error) {
    if (photoKey && !userCreated) {
      try {
        await deleteProfilePhoto(photoKey);
      } catch (cleanupError) {
        console.error("[Auth] Failed to remove an unused profile photo:", cleanupError);
      }
    }
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || "Invalid registration details.",
      });
    }
    if (error instanceof ProfilePhotoUploadError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error("[Auth] Candidate registration error:", error);
    res.status(500).json({ success: false, error: "Unable to create your account right now." });
  }
});

authRouter.post("/register/company", async (req, res) => {
  try {
    const input = registerCompanySchema.parse(req.body);
    const email = input.email.toLowerCase();
    const passwordHash = await hashPassword(input.password);
    const companySlug = `${input.companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "company"}-${randomBytes(5).toString("hex")}`;

    const account = await db.transaction(async (tx) => {
      const [company] = await tx.insert(companies).values({
        name: input.companyName,
        slug: companySlug,
        description: input.description,
        website: input.website || "",
        country: input.country,
        isDemo: false,
        verificationStatus: "pending",
        status: "active",
      }).returning();

      const [newUser] = await tx.insert(users).values({
        name: input.contactName,
        email,
        passwordHash,
        role: "company",
        companyId: company.id,
      }).onConflictDoNothing({ target: users.email }).returning();

      if (!newUser) throw new RegistrationEmailConflict();
      return { company, user: newUser };
    });

    const sessionUser: SessionUser = {
      id: account.user.id,
      name: account.user.name,
      email: account.user.email,
      role: "company",
      companyId: account.company.id,
      companyName: account.company.name,
      isDemo: false,
      profileComplete: true,
    };
    console.log(`[Auth] Company account created: ${email} (company #${account.company.id}, pending verification).`);
    createSession(res, sessionUser, 201);
  } catch (error) {
    if (error instanceof RegistrationEmailConflict) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || "Invalid company registration details.",
      });
    }
    console.error("[Auth] Company registration error:", error);
    res.status(500).json({ success: false, error: "Unable to create the company account right now." });
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
      profileComplete: dbUser.role !== "candidate" || Boolean(dbUser.profilePhotoKey),
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
      profileComplete: user.profileComplete,
    },
  });
});

authRouter.get("/profile", requireRole("candidate"), async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.sessionUser!.id)).limit(1);
    if (!user || user.role !== "candidate") {
      return res.status(404).json({ success: false, error: "Candidate profile not found." });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        headline: user.headline ?? "",
        location: user.location ?? "",
        bio: user.bio ?? "",
        skills: user.skills ?? "",
        linkedinUrl: user.linkedinUrl ?? "",
        githubUrl: user.githubUrl ?? "",
        portfolioUrl: user.portfolioUrl ?? "",
        profileComplete: Boolean(user.profilePhotoKey),
        photoUrl: user.profilePhotoKey ? "/api/auth/profile/photo" : null,
      },
    });
  } catch (error) {
    console.error("[Auth] Candidate profile fetch error:", error);
    res.status(500).json({ success: false, error: "Unable to load your profile right now." });
  }
});

authRouter.put("/profile", requireRole("candidate"), async (req, res) => {
  let newPhotoKey: string | undefined;
  let profileUpdated = false;
  try {
    const input = candidateProfileSchema.parse(req.body);
    const userId = req.sessionUser!.id;
    const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!currentUser || currentUser.role !== "candidate") {
      return res.status(404).json({ success: false, error: "Candidate profile not found." });
    }

    if (input.photoFile) {
      const savedPhoto = await saveProfilePhoto(input.photoFile.mimeType, input.photoFile.data);
      newPhotoKey = savedPhoto.storageKey;
    } else if (!currentUser.profilePhotoKey) {
      return res.status(400).json({ success: false, error: "A profile photo is required." });
    }

    const [updatedUser] = await db.update(users).set({
      name: input.name,
      phone: input.phone,
      headline: input.headline,
      location: input.location,
      bio: input.bio,
      skills: input.skills,
      linkedinUrl: input.linkedinUrl,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      ...(newPhotoKey ? { profilePhotoKey: newPhotoKey } : {}),
      updatedAt: new Date().toISOString(),
    }).where(eq(users.id, userId)).returning();

    if (!updatedUser) {
      throw new Error("Profile update did not return the updated candidate.");
    }
    profileUpdated = true;

    req.sessionUser!.name = updatedUser.name;
    req.sessionUser!.profileComplete = Boolean(updatedUser.profilePhotoKey);

    if (newPhotoKey && currentUser.profilePhotoKey) {
      try {
        await deleteProfilePhoto(currentUser.profilePhotoKey);
      } catch (cleanupError) {
        console.error("[Auth] Failed to remove a replaced profile photo:", cleanupError);
      }
    }

    res.status(200).json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    if (newPhotoKey && !profileUpdated) {
      try {
        await deleteProfilePhoto(newPhotoKey);
      } catch (cleanupError) {
        console.error("[Auth] Failed to remove an unused profile photo:", cleanupError);
      }
    }
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || "Invalid profile details.",
      });
    }
    if (error instanceof ProfilePhotoUploadError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error("[Auth] Candidate profile update error:", error);
    res.status(500).json({ success: false, error: "Unable to update your profile right now." });
  }
});

authRouter.get("/profile/photo", requireRole("candidate"), async (req, res) => {
  try {
    const [user] = await db.select({ profilePhotoKey: users.profilePhotoKey })
      .from(users)
      .where(eq(users.id, req.sessionUser!.id))
      .limit(1);
    if (!user?.profilePhotoKey) {
      return res.status(404).json({ success: false, error: "Profile photo not found." });
    }

    const photo = await readProfilePhoto(user.profilePhotoKey);
    if (!photo) {
      return res.status(404).json({ success: false, error: "Profile photo not found." });
    }

    res.setHeader("Content-Type", photo.mimeType);
    res.setHeader("Cache-Control", "private, max-age=300");
    res.send(photo.buffer);
  } catch (error) {
    console.error("[Auth] Candidate profile photo error:", error);
    res.status(500).json({ success: false, error: "Unable to load your profile photo right now." });
  }
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
