CREATE TABLE `application_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`actor_user_id` integer,
	`from_status` text,
	`to_status` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `app_events_application_idx` ON `application_events` (`application_id`);--> statement-breakpoint
CREATE TABLE `application_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`author_user_id` integer NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `app_notes_application_idx` ON `application_notes` (`application_id`);--> statement-breakpoint
CREATE INDEX `app_notes_author_idx` ON `application_notes` (`author_user_id`);--> statement-breakpoint
CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer NOT NULL,
	`candidate_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`country` text DEFAULT 'Egypt' NOT NULL,
	`years_experience` integer NOT NULL,
	`primary_role` text NOT NULL,
	`skills` text NOT NULL,
	`linkedin_url` text,
	`github_url` text,
	`portfolio_url` text,
	`cv_url` text,
	`introduction` text NOT NULL,
	`consent_at` text NOT NULL,
	`training_interest` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `applications_job_idx` ON `applications` (`job_id`);--> statement-breakpoint
CREATE INDEX `applications_email_idx` ON `applications` (`email`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`website` text NOT NULL,
	`country` text NOT NULL,
	`logo_url` text,
	`is_demo` integer DEFAULT true NOT NULL,
	`verification_status` text DEFAULT 'verified' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_slug_unique` ON `companies` (`slug`);--> statement-breakpoint
CREATE INDEX `companies_slug_idx` ON `companies` (`slug`);--> statement-breakpoint
CREATE INDEX `companies_status_idx` ON `companies` (`status`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`department` text NOT NULL,
	`employment_type` text DEFAULT 'Full-time' NOT NULL,
	`remote_policy` text DEFAULT 'Remote - Egypt' NOT NULL,
	`experience_level` text DEFAULT 'Senior' NOT NULL,
	`salary_min` integer,
	`salary_max` integer,
	`salary_currency` text DEFAULT 'EUR',
	`timezone_overlap` text DEFAULT '±2 hours from Cairo',
	`description` text NOT NULL,
	`responsibilities` text NOT NULL,
	`requirements` text NOT NULL,
	`skills` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`published_at` text,
	`deadline` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_slug_unique` ON `jobs` (`slug`);--> statement-breakpoint
CREATE INDEX `jobs_slug_idx` ON `jobs` (`slug`);--> statement-breakpoint
CREATE INDEX `jobs_company_idx` ON `jobs` (`company_id`);--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);--> statement-breakpoint
CREATE TABLE `partnership_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_name` text NOT NULL,
	`work_email` text NOT NULL,
	`country` text NOT NULL,
	`company_size` text,
	`roles_needed` text NOT NULL,
	`hiring_volume` text,
	`message` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leads_email_idx` ON `partnership_leads` (`work_email`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `partnership_leads` (`status`);--> statement-breakpoint
CREATE TABLE `trainings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`provider_name` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`level` text DEFAULT 'Intermediate' NOT NULL,
	`duration` text NOT NULL,
	`delivery_mode` text DEFAULT 'Online Cohort' NOT NULL,
	`is_optional` integer DEFAULT true NOT NULL,
	`is_demo` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trainings_slug_unique` ON `trainings` (`slug`);--> statement-breakpoint
CREATE INDEX `trainings_slug_idx` ON `trainings` (`slug`);--> statement-breakpoint
CREATE INDEX `trainings_status_idx` ON `trainings` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`company_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_company_idx` ON `users` (`company_id`);