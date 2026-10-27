import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ==========================================
// 1. Users Table (candidates, companies, admins)
// ==========================================
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  profilePhotoKey: text("profile_photo_key"),
  phone: text("phone"),
  headline: text("headline"),
  location: text("location"),
  bio: text("bio"),
  skills: text("skills"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  role: text("role", { enum: ["candidate", "company", "admin"] }).notNull(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "set null" }),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
  companyIdx: index("users_company_idx").on(table.companyId),
}));

// ==========================================
// 2. Companies Table
// ==========================================
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  website: text("website").notNull(),
  country: text("country").notNull(),
  logoUrl: text("logo_url"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(true),
  verificationStatus: text("verification_status", { enum: ["verified", "pending", "unverified"] }).notNull().default("verified"),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  slugIdx: index("companies_slug_idx").on(table.slug),
  statusIdx: index("companies_status_idx").on(table.status),
}));

// ==========================================
// 3. Jobs Table
// ==========================================
export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  department: text("department").notNull(),
  employmentType: text("employment_type").notNull().default("Full-time"), // Full-time, Part-time, Contract
  remotePolicy: text("remote_policy").notNull().default("Remote - Egypt"),
  experienceLevel: text("experience_level").notNull().default("Senior"), // Junior, Mid-level, Senior, Lead
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default("EUR"),
  timezoneOverlap: text("timezone_overlap").default("±2 hours from Cairo"),
  description: text("description").notNull(),
  responsibilities: text("responsibilities").notNull(),
  requirements: text("requirements").notNull(),
  skills: text("skills").notNull(), // Comma-separated list or JSON array string
  status: text("status", { enum: ["draft", "active", "paused", "closed"] }).notNull().default("active"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  deadline: text("deadline"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  slugIdx: index("jobs_slug_idx").on(table.slug),
  companyIdx: index("jobs_company_idx").on(table.companyId),
  statusIdx: index("jobs_status_idx").on(table.status),
}));

// ==========================================
// 4. Trainings Table (Optional Programs)
// ==========================================
export const trainings = sqliteTable("trainings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  providerName: text("provider_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull().default("Intermediate"), // Beginner, Intermediate, Advanced
  duration: text("duration").notNull(),
  deliveryMode: text("delivery_mode").notNull().default("Online Cohort"), // Online Cohort, Self-paced, Hybrid Labs
  isOptional: integer("is_optional", { mode: "boolean" }).notNull().default(true),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(true),
  status: text("status", { enum: ["published", "draft", "archived"] }).notNull().default("published"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  slugIdx: index("trainings_slug_idx").on(table.slug),
  statusIdx: index("trainings_status_idx").on(table.status),
}));

// ==========================================
// 5. Applications Table
// ==========================================
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  candidateName: text("candidate_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country").notNull().default("Egypt"),
  yearsExperience: integer("years_experience").notNull(),
  primaryRole: text("primary_role").notNull(),
  skills: text("skills").notNull(),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  cvUrl: text("cv_url"),
  introduction: text("introduction").notNull(),
  consentAt: text("consent_at").notNull(),
  trainingInterest: integer("training_interest", { mode: "boolean" }).notNull().default(false),
  status: text("status", {
    enum: ["new", "under_review", "shortlisted", "interview", "offer", "hired", "rejected"]
  }).notNull().default("new"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  jobIdx: index("applications_job_idx").on(table.jobId),
  emailIdx: index("applications_email_idx").on(table.email),
  statusIdx: index("applications_status_idx").on(table.status),
}));

// ==========================================
// 6. Application Notes Table
// ==========================================
export const applicationNotes = sqliteTable("application_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  authorUserId: integer("author_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  appIdx: index("app_notes_application_idx").on(table.applicationId),
  authorIdx: index("app_notes_author_idx").on(table.authorUserId),
}));

// ==========================================
// 7. Application Events Table (Audit / History)
// ==========================================
export const applicationEvents = sqliteTable("application_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  actorUserId: integer("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  note: text("note"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  appIdx: index("app_events_application_idx").on(table.applicationId),
}));

// ==========================================
// 8. Partnership Leads Table
// ==========================================
export const partnershipLeads = sqliteTable("partnership_leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestType: text("request_type", { enum: ["partnership", "admin_access"] }).notNull().default("partnership"),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person"),
  workEmail: text("work_email").notNull(),
  phone: text("phone"),
  website: text("website"),
  country: text("country").notNull(),
  companySize: text("company_size"),
  rolesNeeded: text("roles_needed").notNull(),
  hiringVolume: text("hiring_volume"),
  message: text("message"),
  status: text("status", { enum: ["new", "contacted", "partnered", "closed"] }).notNull().default("new"),
  createdAt: text("created_at").default(sql`(datetime('now'))`).notNull(),
}, (table) => ({
  emailIdx: index("leads_email_idx").on(table.workEmail),
  statusIdx: index("leads_status_idx").on(table.status),
}));

// ==========================================
// Relations Definitions
// ==========================================

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  notes: many(applicationNotes),
  events: many(applicationEvents),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const trainingsRelations = relations(trainings, () => ({}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  notes: many(applicationNotes),
  events: many(applicationEvents),
}));

export const applicationNotesRelations = relations(applicationNotes, ({ one }) => ({
  application: one(applications, {
    fields: [applicationNotes.applicationId],
    references: [applications.id],
  }),
  author: one(users, {
    fields: [applicationNotes.authorUserId],
    references: [users.id],
  }),
}));

export const applicationEventsRelations = relations(applicationEvents, ({ one }) => ({
  application: one(applications, {
    fields: [applicationEvents.applicationId],
    references: [applications.id],
  }),
  actor: one(users, {
    fields: [applicationEvents.actorUserId],
    references: [users.id],
  }),
}));

export const partnershipLeadsRelations = relations(partnershipLeads, () => ({}));

// ==========================================
// Inferred TypeScript Types
// ==========================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = typeof trainings.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type InsertApplicationNote = typeof applicationNotes.$inferInsert;

export type ApplicationEvent = typeof applicationEvents.$inferSelect;
export type InsertApplicationEvent = typeof applicationEvents.$inferInsert;

export type PartnershipLead = typeof partnershipLeads.$inferSelect;
export type InsertPartnershipLead = typeof partnershipLeads.$inferInsert;
