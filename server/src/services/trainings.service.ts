import { db } from "../db";
import { trainings, type Training, type InsertTraining } from "@shared/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";

export interface TrainingFilters {
  category?: string;
  level?: string;
  status?: "published" | "draft" | "archived";
  limit?: number;
  offset?: number;
}

export const trainingsService = {
  // 1. List published trainings for public portal
  async listPublicTrainings(filters: Omit<TrainingFilters, "status"> = {}) {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const conditions = [eq(trainings.status, "published")];
    if (filters.category) conditions.push(eq(trainings.category, filters.category));
    if (filters.level) conditions.push(eq(trainings.level, filters.level));

    return await db
      .select()
      .from(trainings)
      .where(and(...conditions))
      .orderBy(desc(trainings.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 2. List all trainings (for admin management)
  async listAllTrainings(filters: TrainingFilters = {}) {
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    const conditions = [];
    if (filters.status) conditions.push(eq(trainings.status, filters.status));
    if (filters.category) conditions.push(eq(trainings.category, filters.category));
    if (filters.level) conditions.push(eq(trainings.level, filters.level));

    return await db
      .select()
      .from(trainings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trainings.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 3. Get training by slug (or numeric id)
  async getTrainingBySlug(slug: string) {
    const isNumeric = /^\d+$/.test(slug);
    const whereCondition = isNumeric
      ? or(eq(trainings.slug, slug), eq(trainings.id, parseInt(slug, 10)))
      : eq(trainings.slug, slug);

    const rows = await db
      .select()
      .from(trainings)
      .where(whereCondition)
      .limit(1);

    return rows[0] || null;
  },

  // 4. Get training by ID
  async getTrainingById(id: number) {
    const rows = await db
      .select()
      .from(trainings)
      .where(eq(trainings.id, id))
      .limit(1);

    return rows[0] || null;
  },

  // 5. Create training
  async createTraining(input: InsertTraining) {
    const [newTraining] = await db
      .insert(trainings)
      .values({
        ...input,
        isOptional: true, // Enforce optional by default
        updatedAt: sql`(datetime('now'))`,
      })
      .returning();

    return newTraining;
  },

  // 6. Update training
  async updateTraining(id: number, input: Partial<InsertTraining>) {
    const [updated] = await db
      .update(trainings)
      .set({
        ...input,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(trainings.id, id))
      .returning();

    return updated || null;
  },
};
