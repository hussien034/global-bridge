import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "@shared/schema";
import { hashPassword } from "./password";

export async function bootstrapAdminAccount(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Platform Administrator";

  if (!email && !password) return;
  if (!email || !password) {
    throw new Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap an admin account.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    if (existing.role !== "admin") {
      throw new Error("ADMIN_EMAIL is already used by a non-admin account.");
    }
    return;
  }

  await db.insert(users).values({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: "admin",
    companyId: null,
  });
  console.log(`[Auth] Bootstrapped admin account for ${email}.`);
}
