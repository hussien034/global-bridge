import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@shared/schema";
import path from "path";

const dbPath = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), "sqlite.db")}`;

export const sqliteClient = createClient({
  url: dbPath,
});

export const db = drizzle(sqliteClient, { schema });

export * from "@shared/schema";
