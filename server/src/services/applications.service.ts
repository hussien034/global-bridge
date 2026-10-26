import { db } from "../db";
import {
  applications,
  jobs,
  companies,
  users,
  applicationNotes,
  applicationEvents,
  type Application,
  type InsertApplication,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface ApplicationFilters {
  companyId?: number;
  jobId?: number;
  status?: Application["status"];
  limit?: number;
  offset?: number;
}

export const applicationsService = {
  // 1. Create a new job application and automatically log initial event
  async createApplication(input: InsertApplication) {
    const [newApp] = await db
      .insert(applications)
      .values({
        ...input,
        status: "new",
        updatedAt: sql`(datetime('now'))`,
      })
      .returning();

    // Auto-create initial application event
    await db.insert(applicationEvents).values({
      applicationId: newApp.id,
      actorUserId: null,
      fromStatus: null,
      toStatus: "new",
      note: "تم استلام طلب التقديم المباشر بنجاح.",
    });

    return newApp;
  },

  // 1b. Check if duplicate application exists for email and job
  async checkDuplicate(jobId: number, email: string) {
    const rows = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.email, email.toLowerCase().trim())))
      .limit(1);

    return Boolean(rows[0]);
  },

  // 2. List applications with filters (joins job and company)
  async listApplications(filters: ApplicationFilters = {}) {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const conditions = [];
    if (filters.status) conditions.push(eq(applications.status, filters.status));
    if (filters.jobId) conditions.push(eq(applications.jobId, filters.jobId));
    if (filters.companyId) conditions.push(eq(jobs.companyId, filters.companyId));

    return await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateName: applications.candidateName,
        email: applications.email,
        phone: applications.phone,
        country: applications.country,
        yearsExperience: applications.yearsExperience,
        primaryRole: applications.primaryRole,
        skills: applications.skills,
        linkedinUrl: applications.linkedinUrl,
        githubUrl: applications.githubUrl,
        portfolioUrl: applications.portfolioUrl,
        cvUrl: applications.cvUrl,
        introduction: applications.introduction,
        consentAt: applications.consentAt,
        trainingInterest: applications.trainingInterest,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          slug: jobs.slug,
          department: jobs.department,
          employmentType: jobs.employmentType,
        },
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          country: companies.country,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(applications.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 3. Get application by ID with full details
  async getApplicationById(id: number) {
    const rows = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateName: applications.candidateName,
        email: applications.email,
        phone: applications.phone,
        country: applications.country,
        yearsExperience: applications.yearsExperience,
        primaryRole: applications.primaryRole,
        skills: applications.skills,
        linkedinUrl: applications.linkedinUrl,
        githubUrl: applications.githubUrl,
        portfolioUrl: applications.portfolioUrl,
        cvUrl: applications.cvUrl,
        introduction: applications.introduction,
        consentAt: applications.consentAt,
        trainingInterest: applications.trainingInterest,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          companyId: jobs.companyId,
          title: jobs.title,
          slug: jobs.slug,
          department: jobs.department,
          employmentType: jobs.employmentType,
          salaryMin: jobs.salaryMin,
          salaryMax: jobs.salaryMax,
          salaryCurrency: jobs.salaryCurrency,
        },
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          country: companies.country,
        },
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.id, id))
      .limit(1);

    if (!rows[0]) return null;

    // Fetch notes and events
    const notes = await this.listNotes(id);
    const events = await this.listEvents(id);

    return {
      ...rows[0],
      notes,
      events,
    };
  },

  // 4. Update application status and log event
  async updateStatus(
    id: number,
    newStatus: Application["status"],
    actorUserId?: number | null,
    note?: string | null
  ) {
    const current = await db
      .select({ status: applications.status })
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);

    if (!current[0]) return null;
    const fromStatus = current[0].status;

    const [updated] = await db
      .update(applications)
      .set({
        status: newStatus,
        updatedAt: sql`(datetime('now'))`,
      })
      .where(eq(applications.id, id))
      .returning();

    // Log the event transition
    await db.insert(applicationEvents).values({
      applicationId: id,
      actorUserId: actorUserId || null,
      fromStatus,
      toStatus: newStatus,
      note: note || `تحديث المرحلة من ${fromStatus} إلى ${newStatus}.`,
    });

    return updated;
  },

  // 5. Add internal note
  async addNote(applicationId: number, authorUserId: number, body: string) {
    const [newNote] = await db
      .insert(applicationNotes)
      .values({
        applicationId,
        authorUserId,
        body,
      })
      .returning();

    return newNote;
  },

  // 6. List notes for application
  async listNotes(applicationId: number) {
    return await db
      .select({
        id: applicationNotes.id,
        applicationId: applicationNotes.applicationId,
        authorUserId: applicationNotes.authorUserId,
        body: applicationNotes.body,
        createdAt: applicationNotes.createdAt,
        authorName: users.name,
        authorRole: users.role,
      })
      .from(applicationNotes)
      .innerJoin(users, eq(applicationNotes.authorUserId, users.id))
      .where(eq(applicationNotes.applicationId, applicationId))
      .orderBy(desc(applicationNotes.createdAt));
  },

  // 7. List timeline events for application
  async listEvents(applicationId: number) {
    return await db
      .select({
        id: applicationEvents.id,
        applicationId: applicationEvents.applicationId,
        actorUserId: applicationEvents.actorUserId,
        fromStatus: applicationEvents.fromStatus,
        toStatus: applicationEvents.toStatus,
        note: applicationEvents.note,
        createdAt: applicationEvents.createdAt,
        actorName: users.name,
      })
      .from(applicationEvents)
      .leftJoin(users, eq(applicationEvents.actorUserId, users.id))
      .where(eq(applicationEvents.applicationId, applicationId))
      .orderBy(desc(applicationEvents.createdAt));
  },
};
