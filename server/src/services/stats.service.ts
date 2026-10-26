import { db } from "../db";
import { companies, jobs, applications, trainings } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";

export const statsService = {
  // 1. Public Portal Stats
  async getPublicStats() {
    const [activeJobs] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.status, "active"));

    const [verifiedCompanies] = await db
      .select({ count: count() })
      .from(companies)
      .where(eq(companies.status, "active"));

    const [publishedTrainings] = await db
      .select({ count: count() })
      .from(trainings)
      .where(eq(trainings.status, "published"));

    return {
      activeJobs: activeJobs.count,
      partnerCompanies: verifiedCompanies.count,
      publishedTrainings: publishedTrainings.count,
      networkTalents: "2,500+ Egyptian Engineers (Network Pool)",
    };
  },

  // 2. Company Dashboard Stats
  async getCompanyStats(companyId: number) {
    const [totalJobs] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.companyId, companyId));

    const [activeJobs] = await db
      .select({ count: count() })
      .from(jobs)
      .where(sql`${jobs.companyId} = ${companyId} AND ${jobs.status} = 'active'`);

    // Applicants stats joined through jobs
    const [totalApplicants] = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(jobs.companyId, companyId));

    const [newApplicants] = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(sql`${jobs.companyId} = ${companyId} AND ${applications.status} = 'new'`);

    const [interviewCount] = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(sql`${jobs.companyId} = ${companyId} AND ${applications.status} = 'interview'`);

    const [offerCount] = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(sql`${jobs.companyId} = ${companyId} AND ${applications.status} = 'offer'`);

    const [hiredCount] = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(sql`${jobs.companyId} = ${companyId} AND ${applications.status} = 'hired'`);

    return {
      totalJobs: totalJobs.count,
      activeJobs: activeJobs.count,
      totalApplicants: totalApplicants.count,
      newApplicants: newApplicants.count,
      interviewCount: interviewCount.count,
      offerCount: offerCount.count,
      hiredCount: hiredCount.count,
    };
  },

  // 3. Admin Dashboard Full Metrics
  async getAdminStats() {
    const [totalCompanies] = await db.select({ count: count() }).from(companies);
    const [activeCompanies] = await db.select({ count: count() }).from(companies).where(eq(companies.status, "active"));

    const [totalJobs] = await db.select({ count: count() }).from(jobs);
    const [activeJobs] = await db.select({ count: count() }).from(jobs).where(eq(jobs.status, "active"));

    const [totalApplicants] = await db.select({ count: count() }).from(applications);
    const [newApplicants] = await db.select({ count: count() }).from(applications).where(eq(applications.status, "new"));
    const [interviewCount] = await db.select({ count: count() }).from(applications).where(eq(applications.status, "interview"));
    const [offerCount] = await db.select({ count: count() }).from(applications).where(eq(applications.status, "offer"));
    const [hiredCount] = await db.select({ count: count() }).from(applications).where(eq(applications.status, "hired"));

    // Distribution by status
    const statusDistribution = await db
      .select({
        status: applications.status,
        count: count(),
      })
      .from(applications)
      .groupBy(applications.status);

    // Jobs by department
    const jobsByDepartment = await db
      .select({
        department: jobs.department,
        count: count(),
      })
      .from(jobs)
      .groupBy(jobs.department);

    return {
      totalCompanies: totalCompanies.count,
      activeCompanies: activeCompanies.count,
      totalJobs: totalJobs.count,
      activeJobs: activeJobs.count,
      totalApplicants: totalApplicants.count,
      newApplicants: newApplicants.count,
      interviewCount: interviewCount.count,
      offerCount: offerCount.count,
      hiredCount: hiredCount.count,
      statusDistribution,
      jobsByDepartment,
    };
  },
};
