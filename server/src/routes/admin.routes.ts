import { Router } from "express";
import {
  jobsService,
  companiesService,
  applicationsService,
  trainingsService,
  statsService,
  leadsService,
} from "../services";
import { requireAdmin } from "../middleware/auth.middleware";
import {
  adminCompanyFilterSchema,
  adminJobFilterSchema,
  adminApplicantFilterSchema,
  updateCompanySchema,
  changeCompanyStatusSchema,
  createJobSchema,
  updateJobSchema,
  changeJobStatusSchema,
  changeApplicantStatusSchema,
  addApplicantNoteSchema,
  createTrainingSchema,
  updateTrainingSchema,
} from "@shared/validators";
import { ZodError } from "zod";
import { db } from "../db";
import { companies, users } from "@shared/schema";
import { hashPassword } from "../auth/password";
import { provisionCompanyAccountSchema } from "@shared/validators";

export const adminRouter = Router();

class AccountEmailConflict extends Error {}

// All admin routes require admin role
adminRouter.use(requireAdmin);

// ==========================================
// 1. Admin Dashboard
// ==========================================

// GET /api/admin/dashboard — full platform metrics
adminRouter.get("/dashboard", async (_req, res) => {
  try {
    const stats = await statsService.getAdminStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("[Admin API] Dashboard error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 2. Admin Company Management
// ==========================================

// GET /api/admin/companies — list all companies with filters
adminRouter.get("/companies", async (req, res) => {
  try {
    const filters = adminCompanyFilterSchema.parse(req.query);
    const companiesList = await companiesService.listCompanies({
      status: filters.status,
      limit: filters.limit,
      offset: filters.offset,
    });

    res.status(200).json({ success: true, count: companiesList.length, data: companiesList });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] List companies error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/companies/:id — get single company
adminRouter.get("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid company ID." });
    }

    const company = await companiesService.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ success: false, error: "Company not found." });
    }

    res.status(200).json({ success: true, data: company });
  } catch (error) {
    console.error("[Admin API] Get company error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/companies — create a new company
adminRouter.post("/companies", async (req, res) => {
  try {
    const input = provisionCompanyAccountSchema.parse(req.body);
    const { accountName, accountEmail, accountPassword, ...companyInput } = input;
    const passwordHash = await hashPassword(accountPassword);

    const newCompany = await db.transaction(async (tx) => {
      const [company] = await tx
        .insert(companies)
        .values(companyInput)
        .returning();
      const [account] = await tx
        .insert(users)
        .values({
          name: accountName,
          email: accountEmail.toLowerCase(),
          passwordHash,
          role: "company",
          companyId: company.id,
        })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });

      if (!account) throw new AccountEmailConflict();
      return company;
    });

    console.log(`[Admin API] Company #${newCompany.id} "${newCompany.name}" created by admin #${req.sessionUser!.id}.`);
    res.status(201).json({ success: true, data: newCompany });
  } catch (error) {
    if (error instanceof AccountEmailConflict) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Admin API] Create company error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/companies/:id — update company fields
adminRouter.patch("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid company ID." });
    }

    const existing = await companiesService.getCompanyById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Company not found." });
    }

    const input = updateCompanySchema.parse(req.body);
    const updated = await companiesService.updateCompany(id, input);

    console.log(`[Admin API] Company #${id} updated by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Admin API] Update company error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/companies/:id/status — activate/suspend company
adminRouter.patch("/companies/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid company ID." });
    }

    const existing = await companiesService.getCompanyById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Company not found." });
    }

    const { status } = changeCompanyStatusSchema.parse(req.body);
    const updated = await companiesService.changeCompanyStatus(id, status);

    console.log(`[Admin API] Company #${id} status → ${status} by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] Change company status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 3. Admin Jobs Management (cross-company)
// ==========================================

// GET /api/admin/jobs — list all jobs across all companies
adminRouter.get("/jobs", async (req, res) => {
  try {
    const filters = adminJobFilterSchema.parse(req.query);
    const jobsList = await jobsService.listAllJobs({
      companyId: filters.companyId,
      status: filters.status,
      department: filters.department,
      limit: filters.limit,
      offset: filters.offset,
    });

    res.status(200).json({ success: true, count: jobsList.length, data: jobsList });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] List all jobs error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/jobs/:id — get single job
adminRouter.get("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid job ID." });
    }

    const job = await jobsService.getJobById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found." });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("[Admin API] Get job error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/jobs/:id — update any job
adminRouter.patch("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid job ID." });
    }

    const existing = await jobsService.getJobById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Job not found." });
    }

    const input = updateJobSchema.parse(req.body);
    const updated = await jobsService.updateJob(id, input);

    console.log(`[Admin API] Job #${id} updated by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Admin API] Update job error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/jobs/:id/status — change any job's status
adminRouter.patch("/jobs/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid job ID." });
    }

    const existing = await jobsService.getJobById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Job not found." });
    }

    const { status } = changeJobStatusSchema.parse(req.body);
    const updated = await jobsService.changeJobStatus(id, status);

    console.log(`[Admin API] Job #${id} status → ${status} by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] Change job status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 4. Admin Applicants Management (cross-company)
// ==========================================

// GET /api/admin/applicants — list all applications
adminRouter.get("/applicants", async (req, res) => {
  try {
    const filters = adminApplicantFilterSchema.parse(req.query);
    const applicantsList = await applicationsService.listApplications({
      companyId: filters.companyId,
      jobId: filters.jobId,
      status: filters.status,
      limit: filters.limit,
      offset: filters.offset,
    });

    res.status(200).json({ success: true, count: applicantsList.length, data: applicantsList });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] List all applicants error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/applicants/:id — get full applicant profile
adminRouter.get("/applicants/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const application = await applicationsService.getApplicationById(id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("[Admin API] Get applicant error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/applicants/:id/status — change any applicant's status
adminRouter.patch("/applicants/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const application = await applicationsService.getApplicationById(id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    const { status, note } = changeApplicantStatusSchema.parse(req.body);
    const updated = await applicationsService.updateStatus(
      id,
      status,
      req.sessionUser!.id,
      note ?? null
    );

    console.log(`[Admin API] Application #${id} status → ${status} by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] Change applicant status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/applicants/:id/notes — add note on any applicant
adminRouter.post("/applicants/:id/notes", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const application = await applicationsService.getApplicationById(id);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    const { body } = addApplicantNoteSchema.parse(req.body);
    const newNote = await applicationsService.addNote(id, req.sessionUser!.id, body);

    console.log(`[Admin API] Note added to application #${id} by admin #${req.sessionUser!.id}.`);
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Admin API] Add note error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/applicants/:id/events — list event history for an applicant
adminRouter.get("/applicants/:id/events", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const events = await applicationsService.listEvents(id);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("[Admin API] List applicant events error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 5. Admin Training Management
// ==========================================

// GET /api/admin/trainings — list all trainings
adminRouter.get("/trainings", async (req, res) => {
  try {
    const trainings = await trainingsService.listAllTrainings();
    res.status(200).json({ success: true, count: trainings.length, data: trainings });
  } catch (error) {
    console.error("[Admin API] List trainings error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/admin/trainings/:id — get single training
adminRouter.get("/trainings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid training ID." });
    }

    const training = await trainingsService.getTrainingById(id);
    if (!training) {
      return res.status(404).json({ success: false, error: "Training not found." });
    }

    res.status(200).json({ success: true, data: training });
  } catch (error) {
    console.error("[Admin API] Get training error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/admin/trainings — create a new training
adminRouter.post("/trainings", async (req, res) => {
  try {
    const input = createTrainingSchema.parse(req.body);
    const newTraining = await trainingsService.createTraining({
      ...input,
      isOptional: true, // Always enforce optional
    });

    console.log(`[Admin API] Training #${newTraining.id} created by admin #${req.sessionUser!.id}.`);
    res.status(201).json({ success: true, data: newTraining });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Admin API] Create training error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/trainings/:id — update training
adminRouter.patch("/trainings/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid training ID." });
    }

    const existing = await trainingsService.getTrainingById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Training not found." });
    }

    const input = updateTrainingSchema.parse(req.body);
    const updated = await trainingsService.updateTraining(id, {
      ...input,
      isOptional: true, // Enforce optional
    });

    console.log(`[Admin API] Training #${id} updated by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Admin API] Update training error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 6. Admin Partnership Leads
// ==========================================

// GET /api/admin/leads — list partnership leads
adminRouter.get("/leads", async (req, res) => {
  try {
    const requestType = req.query.type === "partnership" || req.query.type === "admin_access"
      ? req.query.type
      : undefined;
    const leads = await leadsService.listLeads({ requestType });
    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    console.error("[Admin API] List leads error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/admin/leads/:id/status — update lead status
adminRouter.patch("/leads/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid lead ID." });
    }

    const { status } = req.body as { status?: string };
    if (!status || !["new", "contacted", "partnered", "closed"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    const updated = await leadsService.updateStatus(id, status as "new" | "contacted" | "partnered" | "closed");
    if (!updated) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    console.log(`[Admin API] Lead #${id} status → ${status} by admin #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("[Admin API] Update lead status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 7. Admin Activity / Audit Events
// ==========================================

// GET /api/admin/activity — list recent application events across platform
adminRouter.get("/activity", async (req, res) => {
  try {
    // Get recent events across all applications (limited to 50)
    const { db } = await import("../db");
    const { applicationEvents, applications, jobs, companies, users } = await import("@shared/schema");
    const { desc, eq } = await import("drizzle-orm");

    const events = await db
      .select({
        id: applicationEvents.id,
        applicationId: applicationEvents.applicationId,
        actorUserId: applicationEvents.actorUserId,
        fromStatus: applicationEvents.fromStatus,
        toStatus: applicationEvents.toStatus,
        note: applicationEvents.note,
        createdAt: applicationEvents.createdAt,
        actorName: users.name,
        candidateName: applications.candidateName,
        jobTitle: jobs.title,
        companyName: companies.name,
      })
      .from(applicationEvents)
      .innerJoin(applications, eq(applicationEvents.applicationId, applications.id))
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(users, eq(applicationEvents.actorUserId, users.id))
      .orderBy(desc(applicationEvents.createdAt))
      .limit(50);

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error("[Admin API] Activity feed error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
