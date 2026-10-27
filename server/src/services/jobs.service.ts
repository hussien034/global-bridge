import { db } from "../db";
import { jobs, companies, type Job, type InsertJob } from "@shared/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";

export interface JobFilters {
  companyId?: number;
  status?: "draft" | "active" | "paused" | "closed";
  department?: string;
  experienceLevel?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

function getPublicJobConditions(filters: Omit<JobFilters, "status" | "companyId" | "limit" | "offset"> = {}) {
  const conditions = [eq(jobs.status, "active")];
  if (filters.department) conditions.push(eq(jobs.department, filters.department));
  if (filters.experienceLevel) conditions.push(eq(jobs.experienceLevel, filters.experienceLevel));

  const search = filters.search?.trim().toLowerCase();
  if (search) {
    const searchCondition = or(
      sql`instr(lower(${jobs.title}), ${search}) > 0`,
      sql`instr(lower(${jobs.department}), ${search}) > 0`,
      sql`instr(lower(${jobs.skills}), ${search}) > 0`,
      sql`instr(lower(${companies.name}), ${search}) > 0`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  return conditions;
}

export const jobsService = {
  // 1. List active jobs for public browsing with company details
  async listActiveJobs(filters: Omit<JobFilters, "status"> = {}) {
    const limit = filters.limit ?? 12;
    const offset = filters.offset ?? 0;
    const conditions = getPublicJobConditions(filters);
    if (filters.companyId) conditions.push(eq(jobs.companyId, filters.companyId));

    return await db
      .select({
        id: jobs.id,
        companyId: jobs.companyId,
        title: jobs.title,
        slug: jobs.slug,
        department: jobs.department,
        employmentType: jobs.employmentType,
        remotePolicy: jobs.remotePolicy,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        timezoneOverlap: jobs.timezoneOverlap,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        skills: jobs.skills,
        status: jobs.status,
        isFeatured: jobs.isFeatured,
        publishedAt: jobs.publishedAt,
        deadline: jobs.deadline,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          country: companies.country,
          website: companies.website,
          logoUrl: companies.logoUrl,
          isDemo: companies.isDemo,
          verificationStatus: companies.verificationStatus,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(...conditions))
      .orderBy(desc(jobs.isFeatured), desc(jobs.createdAt), desc(jobs.id))
      .limit(limit)
      .offset(offset);
  },

  async countActiveJobs(filters: Omit<JobFilters, "status" | "limit" | "offset" | "companyId"> = {}) {
    const conditions = getPublicJobConditions(filters);
    const [result] = await db
      .select({ total: sql<number>`count(*)` })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(...conditions));

    return result.total;
  },

  // 2. List all jobs (for company or admin dashboards)
  async listAllJobs(filters: JobFilters = {}) {
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    const conditions = [];
    if (filters.status) conditions.push(eq(jobs.status, filters.status));
    if (filters.companyId) conditions.push(eq(jobs.companyId, filters.companyId));
    if (filters.department) conditions.push(eq(jobs.department, filters.department));
    if (filters.experienceLevel) conditions.push(eq(jobs.experienceLevel, filters.experienceLevel));

    return await db
      .select({
        id: jobs.id,
        companyId: jobs.companyId,
        title: jobs.title,
        slug: jobs.slug,
        department: jobs.department,
        employmentType: jobs.employmentType,
        remotePolicy: jobs.remotePolicy,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        timezoneOverlap: jobs.timezoneOverlap,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        skills: jobs.skills,
        status: jobs.status,
        isFeatured: jobs.isFeatured,
        publishedAt: jobs.publishedAt,
        deadline: jobs.deadline,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          country: companies.country,
          logoUrl: companies.logoUrl,
          isDemo: companies.isDemo,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 3. Get single job by slug (or numeric id) with company details
  async getJobBySlug(slug: string) {
    const isNumeric = /^\d+$/.test(slug);
    const whereCondition = isNumeric
      ? or(eq(jobs.slug, slug), eq(jobs.id, parseInt(slug, 10)))
      : eq(jobs.slug, slug);

    const rows = await db
      .select({
        id: jobs.id,
        companyId: jobs.companyId,
        title: jobs.title,
        slug: jobs.slug,
        department: jobs.department,
        employmentType: jobs.employmentType,
        remotePolicy: jobs.remotePolicy,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        timezoneOverlap: jobs.timezoneOverlap,
        description: jobs.description,
        responsibilities: jobs.responsibilities,
        requirements: jobs.requirements,
        skills: jobs.skills,
        status: jobs.status,
        isFeatured: jobs.isFeatured,
        publishedAt: jobs.publishedAt,
        deadline: jobs.deadline,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          description: companies.description,
          country: companies.country,
          website: companies.website,
          logoUrl: companies.logoUrl,
          isDemo: companies.isDemo,
          verificationStatus: companies.verificationStatus,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(whereCondition)
      .limit(1);

    return rows[0] || null;
  },

  // 4. Get single job by id
  async getJobById(id: number) {
    const rows = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    return rows[0] || null;
  },

  // 5. Create new job
  async createJob(input: InsertJob) {
    const [newJob] = await db
      .insert(jobs)
      .values({
        ...input,
        updatedAt: sql`(datetime('now'))`,
      })
      .returning();

    return newJob;
  },

  // 6. Update existing job
  async updateJob(id: number, input: Partial<InsertJob>) {
    const [updated] = await db
      .update(jobs)
      .set({
        ...input,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(jobs.id, id))
      .returning();

    return updated || null;
  },

  // 7. Change job status
  async changeJobStatus(id: number, status: Job["status"]) {
    const [updated] = await db
      .update(jobs)
      .set({
        status,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(jobs.id, id))
      .returning();

    return updated || null;
  },
};
