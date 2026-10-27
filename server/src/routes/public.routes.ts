import { Router } from "express";
import {
  jobsService,
  trainingsService,
  applicationsService,
  leadsService,
  statsService,
} from "../services";
import {
  createApplicationSchema,
  createPartnershipLeadSchema,
  createAdminAccessRequestSchema,
  jobFilterSchema,
  trainingFilterSchema,
} from "@shared/validators";
import { ZodError } from "zod";
import { CvUploadError, deleteCandidateCv, saveCandidateCv } from "../services/cv-storage";

export const publicRouter = Router();

// ==========================================
// 1. Jobs Endpoints
// ==========================================

// GET /api/public/jobs - List active jobs with optional filters
publicRouter.get("/jobs", async (req, res) => {
  try {
    const filters = jobFilterSchema.parse(req.query);
    const jobFilters = {
      department: filters.department,
      experienceLevel: filters.experienceLevel,
      search: filters.search,
      limit: filters.limit,
      offset: filters.offset,
    };
    const [jobsList, total] = await Promise.all([
      jobsService.listActiveJobs(jobFilters),
      jobsService.countActiveJobs(jobFilters),
    ]);

    res.status(200).json({
      success: true,
      count: jobsList.length,
      pagination: {
        total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: filters.offset + jobsList.length < total,
      },
      data: jobsList,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Public API] Failed to list jobs:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/public/jobs/:slug - Get single active job details
publicRouter.get("/jobs/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const job = await jobsService.getJobBySlug(slug);

    if (!job || job.status !== "active") {
      return res.status(404).json({
        success: false,
        error: "Job not found or is no longer accepting applications.",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("[Public API] Failed to get job:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 2. Application Submission Endpoint
// ==========================================

// POST /api/public/applications - Submit candidate application
publicRouter.post("/applications", async (req, res) => {
  try {
    // 1. Validate inputs (email, URLs, required fields, consent)
    const input = createApplicationSchema.parse(req.body);

    // 2. Verify target job exists and is ACTIVE
    const targetJob = await jobsService.getJobById(input.jobId);
    if (!targetJob || targetJob.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Cannot apply: This job does not exist or is no longer active.",
      });
    }

    // 3. Prevent duplicate applications with the same email for this job
    const isDuplicate = await applicationsService.checkDuplicate(input.jobId, input.email);
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        error: "An application with this email address has already been submitted for this position.",
      });
    }

    const cvStorageKey = input.cvFile
      ? await saveCandidateCv(input.cvFile.name, input.cvFile.data)
      : null;

    // 4. Save application
    let newApplication;
    try {
      newApplication = await applicationsService.createApplication({
        jobId: input.jobId,
        candidateName: input.candidateName,
        email: input.email.toLowerCase().trim(),
        phone: input.phone || null,
        country: input.country || "Egypt",
        yearsExperience: input.yearsExperience,
        primaryRole: input.primaryRole,
        skills: input.skills,
        linkedinUrl: input.linkedinUrl || null,
        githubUrl: input.githubUrl || null,
        portfolioUrl: input.portfolioUrl || null,
        cvUrl: cvStorageKey ? `uploaded:${cvStorageKey}` : input.cvUrl || null,
        introduction: input.introduction,
        consentAt: input.consentAt,
        trainingInterest: Boolean(input.trainingInterest),
        status: "new",
      });
    } catch (error) {
      if (cvStorageKey) await deleteCandidateCv(cvStorageKey);
      throw error;
    }

    // Sanitized log without sensitive personal data
    console.log(`[Public API] New application #${newApplication.id} received for Job #${input.jobId}.`);

    // 5. Response: Strict no-promise policy
    res.status(201).json({
      success: true,
      applicationId: newApplication.id,
      message: "Application received. Our team will review your profile and contact you if there is a match.",
    });
  } catch (error) {
    if (error instanceof CvUploadError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Public API] Failed to submit application:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 3. Trainings Endpoints (Optional Programs)
// ==========================================

// GET /api/public/trainings - List published trainings
publicRouter.get("/trainings", async (req, res) => {
  try {
    const filters = trainingFilterSchema.parse(req.query);
    const trainingsList = await trainingsService.listPublicTrainings({
      category: filters.category,
      level: filters.level,
      limit: filters.limit,
      offset: filters.offset,
    });

    res.status(200).json({
      success: true,
      count: trainingsList.length,
      data: trainingsList,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("[Public API] Failed to list trainings:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/public/trainings/:slug - Get single published training
publicRouter.get("/trainings/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const training = await trainingsService.getTrainingBySlug(slug);

    if (!training || training.status !== "published") {
      return res.status(404).json({
        success: false,
        error: "Training program not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: training,
    });
  } catch (error) {
    console.error("[Public API] Failed to get training:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 4. Partnership Leads Endpoint
// ==========================================

// POST /api/public/partnership-leads - Register company partnership interest
publicRouter.post("/partnership-leads", async (req, res) => {
  try {
    const input = createPartnershipLeadSchema.parse(req.body);

    const lead = await leadsService.createLead({
      requestType: "partnership",
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      workEmail: input.workEmail.toLowerCase().trim(),
      phone: input.phone || null,
      website: input.website || null,
      country: input.country,
      companySize: input.companySize || null,
      rolesNeeded: input.rolesNeeded,
      hiringVolume: input.hiringVolume || null,
      message: input.message || null,
      status: "new",
    });

    console.log(`[Public API] New partnership lead #${lead.id} received from ${input.companyName}.`);

    res.status(201).json({
      success: true,
      leadId: lead.id,
      message: "Partnership inquiry received. Our team will reach out to your company shortly.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Public API] Failed to submit partnership lead:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/public/admin-access-requests — request a reviewed admin account
publicRouter.post("/admin-access-requests", async (req, res) => {
  try {
    const input = createAdminAccessRequestSchema.parse(req.body);
    const lead = await leadsService.createLead({
      requestType: "admin_access",
      companyName: "طلب صلاحية إدارة المنصة",
      contactPerson: input.name,
      workEmail: input.email.toLowerCase().trim(),
      phone: null,
      website: null,
      country: "غير محدد",
      companySize: null,
      rolesNeeded: "صلاحية الوصول إلى مساحة إدارة المنصة",
      hiringVolume: null,
      message: input.reason,
      status: "new",
    });

    console.log(`[Public API] Admin access request #${lead.id} received.`);
    res.status(201).json({
      success: true,
      leadId: lead.id,
      message: "تم استلام طلب صلاحية الإدارة. ستتم مراجعته والتواصل معك.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        errors: error.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    console.error("[Public API] Failed to submit admin access request:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================================
// 5. Public Statistics Endpoint
// ==========================================

// GET /api/public/stats - Get public metrics
publicRouter.get("/stats", async (_req, res) => {
  try {
    const stats = await statsService.getPublicStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[Public API] Failed to get public stats:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
