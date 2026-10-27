import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@shared/schema";
import path from "path";

const dbPath = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), "sqlite.db")}`;

export const sqliteClient = createClient({
  url: dbPath,
});

async function ensureSchemaCompatibility() {
  try {
    const tableColumns: Record<string, Array<[string, string]>> = {
      users: [
        ["password_hash", "text"],
        ["profile_photo_key", "text"],
        ["phone", "text"],
        ["headline", "text"],
        ["location", "text"],
        ["bio", "text"],
        ["skills", "text"],
        ["linkedin_url", "text"],
        ["github_url", "text"],
        ["portfolio_url", "text"],
      ],
      partnership_leads: [["request_type", "text NOT NULL DEFAULT 'partnership'"]],
    };

    for (const [table, columnsToEnsure] of Object.entries(tableColumns)) {
      const result = await sqliteClient.execute(`PRAGMA table_info('${table}')`);
      const columns = result.rows as unknown as Array<{ name: string }>;
      if (columns.length === 0) {
        throw new Error(`Required database table "${table}" does not exist. Apply the database schema before starting the server.`);
      }

      const existingColumns = new Set(columns.map((column) => column.name));
      for (const [column, definition] of columnsToEnsure) {
        if (existingColumns.has(column)) continue;
        console.warn(`[DB] Adding missing ${table}.${column} column.`);
        await sqliteClient.execute(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`);
      }
    }
  } catch (error) {
    console.error("[DB] Failed to ensure database schema compatibility:", error);
    throw error;
  }
}

await ensureSchemaCompatibility();

export const db = drizzle(sqliteClient, { schema });

export * from "@shared/schema";
