import { db } from "../db";
import { companies, type Company, type InsertCompany } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface CompanyFilters {
  status?: "active" | "suspended";
  limit?: number;
  offset?: number;
}

export const companiesService = {
  // 1. List companies with filters
  async listCompanies(filters: CompanyFilters = {}) {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    let query = db.select().from(companies);
    if (filters.status) {
      query = query.where(eq(companies.status, filters.status)) as typeof query;
    }

    return await query
      .orderBy(desc(companies.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 2. Get company by ID
  async getCompanyById(id: number) {
    const rows = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    return rows[0] || null;
  },

  // 3. Get company by slug
  async getCompanyBySlug(slug: string) {
    const rows = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, slug))
      .limit(1);

    return rows[0] || null;
  },

  // 4. Create new company
  async createCompany(input: InsertCompany) {
    const [newCompany] = await db
      .insert(companies)
      .values({
        ...input,
        updatedAt: sql`(datetime('now'))`,
      })
      .returning();

    return newCompany;
  },

  // 5. Update company
  async updateCompany(id: number, input: Partial<InsertCompany>) {
    const [updated] = await db
      .update(companies)
      .set({
        ...input,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(companies.id, id))
      .returning();

    return updated || null;
  },

  // 6. Change company status
  async changeCompanyStatus(id: number, status: Company["status"]) {
    const [updated] = await db
      .update(companies)
      .set({
        status,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(companies.id, id))
      .returning();

    return updated || null;
  },
};
