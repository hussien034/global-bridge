import { z } from "zod";

// Helper for optional URL or empty string
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val === "" || /^https?:\/\/.+/i.test(val), {
    message: "Must be a valid URL starting with http:// or https://",
  });

// 1. Application submission schema
export const createApplicationSchema = z.object({
  jobId: z.coerce.number().int().positive("Job ID is required"),
  candidateName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  country: z.string().trim().default("Egypt"),
  yearsExperience: z.coerce.number().int().min(0, "Years of experience cannot be negative").max(40),
  primaryRole: z.string().trim().min(2, "Primary role is required"),
  skills: z
    .union([z.string().trim(), z.array(z.string().trim())])
    .transform((value) => (Array.isArray(value) ? value.filter(Boolean).join(", ") : value))
    .pipe(z.string().min(2, "At least one skill must be provided")),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  cvUrl: optionalUrl,
  cvFile: z.object({
    name: z.string().trim().min(1).max(255),
    data: z.string().min(1).max(7 * 1024 * 1024),
  }).optional(),
  introduction: z.string().trim().max(2000).optional().default(""),
  consentAt: z.string().min(1, "Consent to process data is required"),
  trainingInterest: z.coerce.boolean().optional().default(false),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

// 2. Partnership Lead submission schema
export const createPartnershipLeadSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  contactPerson: z.string().trim().min(2, "Contact person must be at least 2 characters"),
  workEmail: z.string().trim().email("Invalid work email address"),
  phone: z.string().trim().optional(),
  website: optionalUrl,
  country: z.string().trim().min(2, "Country is required"),
  companySize: z.string().trim().optional(),
  rolesNeeded: z.string().trim().min(2, "Roles needed must be specified"),
  hiringVolume: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export type CreatePartnershipLeadInput = z.infer<typeof createPartnershipLeadSchema>;

export const createAdminAccessRequestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  reason: z.string().trim().min(20, "Please provide at least 20 characters").max(1000),
});

export type CreateAdminAccessRequestInput = z.infer<typeof createAdminAccessRequestSchema>;

// 3. Job filters query schema
export const jobFilterSchema = z.object({
  department: z.string().optional(),
  experienceLevel: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type JobFilterQuery = z.infer<typeof jobFilterSchema>;

// 4. Training filters query schema
export const trainingFilterSchema = z.object({
  category: z.string().optional(),
  level: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type TrainingFilterQuery = z.infer<typeof trainingFilterSchema>;

// ==========================================
// Company / Admin Validation Schemas
// ==========================================

// 5. Create Job schema (Company)
export const createJobSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  department: z.string().trim().min(2, "Department is required").default("Engineering"),
  employmentType: z.string().trim().default("Full-time"),
  remotePolicy: z.string().trim().default("Remote - Egypt"),
  experienceLevel: z.string().trim().default("Senior"),
  salaryMin: z.coerce.number().int().min(0).optional().nullable(),
  salaryMax: z.coerce.number().int().min(0).optional().nullable(),
  salaryCurrency: z.string().trim().optional().nullable().default("EUR"),
  timezoneOverlap: z.string().trim().optional().nullable().default("±2 hours from Cairo"),
  description: z.string().trim().min(5, "Description must be at least 5 characters"),
  responsibilities: z.string().trim().optional().default(""),
  requirements: z.string().trim().optional().default(""),
  skills: z.union([z.string(), z.array(z.string())]).transform((val) => (Array.isArray(val) ? val.join(", ") : val)),
  status: z.enum(["draft", "active", "paused", "closed"]).default("draft"),
  isFeatured: z.coerce.boolean().optional().default(false),
  deadline: z.string().trim().optional().nullable(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// 6. Update Job schema (partial of create)
export const updateJobSchema = createJobSchema.partial();
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// 7. Change Job Status schema
export const changeJobStatusSchema = z.object({
  status: z.enum(["draft", "active", "paused", "closed"]),
});

// 8. Change Applicant Status schema
export const changeApplicantStatusSchema = z.object({
  status: z.enum(["new", "under_review", "shortlisted", "interview", "offer", "hired", "rejected"]),
  note: z.string().trim().optional().nullable(),
});

// 9. Add Applicant Note schema
export const addApplicantNoteSchema = z.object({
  body: z.string().trim().min(1, "Note body is required").max(5000),
});

// 10. Company applicant filters
export const applicantFilterSchema = z.object({
  jobId: z.coerce.number().int().positive().optional(),
  status: z.enum(["new", "under_review", "shortlisted", "interview", "offer", "hired", "rejected"]).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type ApplicantFilterQuery = z.infer<typeof applicantFilterSchema>;

// 11. Create Company schema (Admin)
export const createCompanySchema = z.object({
  name: z.string().trim().min(2, "Company name must be at least 2 characters").max(200),
  slug: z.string().trim().min(2, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  website: z.string().trim().url("Invalid website URL"),
  country: z.string().trim().min(2, "Country is required"),
  logoUrl: z
    .string()
    .trim()
    .url("Logo must be a valid image URL")
    .refine((url) => /^https?:\/\//i.test(url), "Logo must use HTTP or HTTPS"),
  isDemo: z.coerce.boolean().optional().default(true),
  verificationStatus: z.enum(["verified", "pending", "unverified"]).default("pending"),
  status: z.enum(["active", "suspended"]).default("active"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

// 12. Update Company schema (Admin)
export const updateCompanySchema = createCompanySchema.partial();
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const registerCandidateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  password: z.string().min(12, "Password must be at least 12 characters").max(128),
});

export type RegisterCandidateInput = z.infer<typeof registerCandidateSchema>;

export const provisionCompanyAccountSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(10),
  website: z.string().trim().url(),
  country: z.string().trim().min(2),
  logoUrl: z.string().trim().url().refine((url) => /^https?:\/\//i.test(url)),
  isDemo: z.coerce.boolean().optional().default(false),
  verificationStatus: z.enum(["verified", "pending", "unverified"]).default("pending"),
  status: z.enum(["active", "suspended"]).default("active"),
  accountName: z.string().trim().min(2).max(100),
  accountEmail: z.string().trim().email().max(254),
  accountPassword: z.string().min(12).max(128),
});

export type ProvisionCompanyAccountInput = z.infer<typeof provisionCompanyAccountSchema>;

// 13. Change Company Status schema (Admin)
export const changeCompanyStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

// 14. Create Training schema (Admin)
export const createTrainingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  slug: z.string().trim().min(2, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  providerName: z.string().trim().min(2, "Provider name is required"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  category: z.string().trim().min(2, "Category is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
  duration: z.string().trim().min(1, "Duration is required"),
  deliveryMode: z.enum(["Online Cohort", "Self-paced", "Hybrid Labs"]).default("Online Cohort"),
  isOptional: z.coerce.boolean().optional().default(true),
  isDemo: z.coerce.boolean().optional().default(true),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;

// 15. Update Training schema (Admin)
export const updateTrainingSchema = createTrainingSchema.partial();
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;

// 16. Admin company list filters
export const adminCompanyFilterSchema = z.object({
  status: z.enum(["active", "suspended"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// 17. Admin jobs list filters
export const adminJobFilterSchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  status: z.enum(["draft", "active", "paused", "closed"]).optional(),
  department: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// 18. Admin applicants list filters
export const adminApplicantFilterSchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  jobId: z.coerce.number().int().positive().optional(),
  status: z.enum(["new", "under_review", "shortlisted", "interview", "offer", "hired", "rejected"]).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
