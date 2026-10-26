import { Router } from "express";
import {
  jobsService,
  applicationsService,
  statsService,
} from "../services";
import {
  requireRole,
  requireCompanyOwnership,
} from "../middleware/auth.middleware";
import {
  createJobSchema,
  updateJobSchema,
  changeJobStatusSchema,
  changeApplicantStatusSchema,
  addApplicantNoteSchema,
  applicantFilterSchema,
} from "@shared/validators";
import { ZodError } from "zod";
import { readCandidateCv } from "../services/cv-storage";

export const companyRouter = Router();

// All company routes require authenticated company or admin role
companyRouter.use(requireRole("company", "admin"));

// ==========================================
// 1. Company Dashboard
// ==========================================

// GET /api/company/dashboard — aggregate stats for the logged-in company
companyRouter.get("/dashboard", async (req, res) => {
  try {
    const companyId = req.sessionUser!.companyId;
    if (!companyId) {
      return res.status(403).json({ success: false, error: "No company associated with this account." });
    }

    const stats = await statsService.getCompanyStats(companyId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("[Company API] Dashboard error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 2. Company Jobs Management
// ==========================================

// GET /api/company/jobs — list own jobs
companyRouter.get("/jobs", async (req, res) => {
  try {
    const companyId = req.sessionUser!.companyId;
    if (!companyId) {
      return res.status(403).json({ success: false, error: "No company associated." });
    }

    const jobsList = await jobsService.listAllJobs({ companyId });
    res.status(200).json({ success: true, count: jobsList.length, data: jobsList });
  } catch (error) {
    console.error("[Company API] List jobs error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/company/jobs/:id — get single own job
companyRouter.get("/jobs/:id", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ success: false, error: "Invalid job ID." });
    }

    const job = await jobsService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found." });
    }

    // Ownership check: company users can only see their own jobs
    if (req.sessionUser!.role === "company" && job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden. This job belongs to another company." });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("[Company API] Get job error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/company/jobs — create a new job
companyRouter.post("/jobs", async (req, res) => {
  try {
    const companyId = req.sessionUser!.companyId;
    if (!companyId) {
      return res.status(403).json({ success: false, error: "No company associated." });
    }

    const input = createJobSchema.parse(req.body);

    // Generate slug from title
    const slug = input.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80)
      + `-${Date.now().toString(36)}`;

    const newJob = await jobsService.createJob({
      ...input,
      companyId,
      slug,
      publishedAt: input.status === "active" ? new Date().toISOString() : null,
    });

    console.log(`[Company API] Job #${newJob.id} created by company #${companyId}.`);
    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    if (error instanceof ZodError) {
      const errorDetails = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(" | ");
      console.warn(`[Company API] Validation failed for createJob: ${errorDetails}`);
      return res.status(400).json({
        success: false,
        error: errorDetails,
        errors: error.errors,
      });
    }
    console.error("[Company API] Create job error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/company/jobs/:id — update job fields
companyRouter.patch("/jobs/:id", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ success: false, error: "Invalid job ID." });
    }

    // Verify ownership
    const existing = await jobsService.getJobById(jobId);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Job not found." });
    }
    if (req.sessionUser!.role === "company" && existing.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const input = updateJobSchema.parse(req.body);
    const updated = await jobsService.updateJob(jobId, input);

    console.log(`[Company API] Job #${jobId} updated by user #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Company API] Update job error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/company/jobs/:id/status — change job status (active, paused, closed, draft)
companyRouter.patch("/jobs/:id/status", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ success: false, error: "Invalid job ID." });
    }

    const existing = await jobsService.getJobById(jobId);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Job not found." });
    }
    if (req.sessionUser!.role === "company" && existing.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const { status } = changeJobStatusSchema.parse(req.body);

    // Set publishedAt when activating
    const updateData: Record<string, unknown> = { status };
    if (status === "active" && !existing.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    const updated = await jobsService.changeJobStatus(jobId, status);

    console.log(`[Company API] Job #${jobId} status → ${status} by user #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Company API] Change job status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 3. Company Applicant Management
// ==========================================

// GET /api/company/applicants — list applicants for own company's jobs
companyRouter.get("/applicants", async (req, res) => {
  try {
    const companyId = req.sessionUser!.companyId;
    if (!companyId) {
      return res.status(403).json({ success: false, error: "No company associated." });
    }

    const filters = applicantFilterSchema.parse(req.query);
    const applicantsList = await applicationsService.listApplications({
      companyId,
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
    console.error("[Company API] List applicants error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/company/applicants/:id — get applicant full profile with notes and events
companyRouter.get("/applicants/:id", async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const application = await applicationsService.getApplicationById(appId);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    // Ownership check: ensure applicant's job belongs to this company
    if (req.sessionUser!.role === "company" &&
        application.job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({
        success: false,
        error: "Forbidden. This applicant applied to another company's job.",
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("[Company API] Get applicant error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/company/applicants/:id/cv — download an applicant's uploaded CV
companyRouter.get("/applicants/:id/cv", async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const application = await applicationsService.getApplicationById(appId);
    if (!application || !application.cvUrl?.startsWith("uploaded:")) {
      return res.status(404).json({ success: false, error: "Uploaded CV not found." });
    }

    if (req.sessionUser!.role === "company" &&
        application.job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const cv = await readCandidateCv(application.cvUrl.slice("uploaded:".length));
    if (!cv) {
      return res.status(404).json({ success: false, error: "Uploaded CV not found." });
    }

    res
      .status(200)
      .type("application/pdf")
      .set("Content-Disposition", 'attachment; filename="candidate-cv.pdf"')
      .set("Cache-Control", "private, no-store")
      .set("X-Content-Type-Options", "nosniff")
      .send(cv);
  } catch (error) {
    console.error("[Company API] Download applicant CV error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// PATCH /api/company/applicants/:id/status — change applicant status + log event
companyRouter.patch("/applicants/:id/status", async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    // Verify application exists
    const application = await applicationsService.getApplicationById(appId);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    // Ownership check
    if (req.sessionUser!.role === "company" &&
        application.job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const { status, note } = changeApplicantStatusSchema.parse(req.body);

    const updated = await applicationsService.updateStatus(
      appId,
      status,
      req.sessionUser!.id,
      note ?? null
    );

    console.log(`[Company API] Application #${appId} status → ${status} by user #${req.sessionUser!.id}.`);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Company API] Change applicant status error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/company/applicants/:id/notes — add internal evaluation note
companyRouter.post("/applicants/:id/notes", async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    // Verify application exists
    const application = await applicationsService.getApplicationById(appId);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }

    // Ownership check
    if (req.sessionUser!.role === "company" &&
        application.job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const { body } = addApplicantNoteSchema.parse(req.body);

    const newNote = await applicationsService.addNote(
      appId,
      req.sessionUser!.id,
      body
    );

    console.log(`[Company API] Note added to application #${appId} by user #${req.sessionUser!.id}.`);
    res.status(201).json({ success: true, data: newNote });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Company API] Add note error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/company/applicants/:id/notes — list notes for an applicant
companyRouter.get("/applicants/:id/notes", async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    // Verify ownership
    const application = await applicationsService.getApplicationById(appId);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }
    if (req.sessionUser!.role === "company" &&
        application.job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const notes = await applicationsService.listNotes(appId);
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    console.error("[Company API] List notes error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/company/applicants/:id/events — list timeline events for an applicant
companyRouter.get("/applicants/:id/events", async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ success: false, error: "Invalid applicant ID." });
    }

    const application = await applicationsService.getApplicationById(appId);
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found." });
    }
    if (req.sessionUser!.role === "company" &&
        application.job.companyId !== req.sessionUser!.companyId) {
      return res.status(403).json({ success: false, error: "Forbidden." });
    }

    const events = await applicationsService.listEvents(appId);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("[Company API] List events error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
