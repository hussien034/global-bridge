import { count, eq, inArray } from "drizzle-orm";
import { companies, jobs } from "@shared/schema";
import { db } from "./index";

const demoCompanies = [
  {
    name: "Northstar Labs",
    slug: "northstar-labs",
    country: "Netherlands",
    description: "Demo technology company building distributed cloud products.",
    website: "https://northstar-labs.demo",
  },
  {
    name: "Cedarline Software",
    slug: "cedarline-software",
    country: "United Kingdom",
    description: "Demo software company building SaaS and financial technology products.",
    website: "https://cedarline.demo",
  },
  {
    name: "Atlas Product Studio",
    slug: "atlas-product-studio",
    country: "Germany",
    description: "Demo product studio delivering digital platforms for global teams.",
    website: "https://atlas-studio.demo",
  },
  {
    name: "Harborlight Digital (Demo)",
    slug: "harborlight-digital-demo",
    country: "Sweden",
    description: "Fictional demo partner focused on digital services and customer platforms.",
    website: "https://harborlight.demo",
  },
  {
    name: "Meridian Cloud Works (Demo)",
    slug: "meridian-cloud-works-demo",
    country: "Canada",
    description: "Fictional demo partner building cloud infrastructure and data products.",
    website: "https://meridian-cloud.demo",
  },
] as const;

const roles = [
  { slug: "frontend-engineer", title: "Frontend Engineer", department: "Web Application", skills: "React, TypeScript, CSS, Accessibility", salary: 2800 },
  { slug: "backend-engineer", title: "Backend Engineer", department: "Backend Infrastructure", skills: "Node.js, TypeScript, PostgreSQL, REST APIs", salary: 3200 },
  { slug: "full-stack-engineer", title: "Full Stack Engineer", department: "Software Engineering", skills: "React, Node.js, TypeScript, SQL", salary: 3200 },
  { slug: "qa-automation-engineer", title: "QA Automation Engineer", department: "Quality Engineering", skills: "Playwright, Cypress, TypeScript, CI/CD", salary: 2600 },
  { slug: "devops-engineer", title: "DevOps Engineer", department: "Cloud Operations", skills: "AWS, Docker, Kubernetes, Terraform", salary: 3400 },
  { slug: "data-analyst", title: "Data Analyst", department: "Data & Analytics", skills: "SQL, Python, Power BI, Data Modeling", salary: 2300 },
  { slug: "data-engineer", title: "Data Engineer", department: "Data & Analytics", skills: "Python, SQL, Airflow, Spark", salary: 3300 },
  { slug: "machine-learning-engineer", title: "Machine Learning Engineer", department: "AI & Machine Learning", skills: "Python, PyTorch, MLflow, Model Serving", salary: 3600 },
  { slug: "mobile-developer", title: "Mobile Application Developer", department: "Mobile Applications", skills: "React Native, TypeScript, iOS, Android", salary: 2900 },
  { slug: "security-analyst", title: "Cybersecurity Analyst", department: "Cybersecurity", skills: "SIEM, Incident Response, Linux, Security Reviews", salary: 3100 },
  { slug: "product-designer", title: "Product Designer", department: "Product Design", skills: "Figma, UX Research, Prototyping, Design Systems", salary: 2600 },
  { slug: "product-manager", title: "Product Manager", department: "Product Management", skills: "Roadmapping, Discovery, Analytics, Agile", salary: 3400 },
  { slug: "business-analyst", title: "Business Analyst", department: "Business Analysis", skills: "Requirements, SQL, Process Mapping, Stakeholder Management", salary: 2500 },
  { slug: "technical-support-specialist", title: "Technical Support Specialist", department: "Technical Support", skills: "Troubleshooting, APIs, SQL, Customer Support", salary: 1800 },
  { slug: "customer-success-manager", title: "Customer Success Manager", department: "Customer Success", skills: "SaaS, Onboarding, CRM, Account Management", salary: 2400 },
  { slug: "technical-writer", title: "Technical Writer", department: "Technical Writing", skills: "API Documentation, Markdown, Git, Information Architecture", salary: 2100 },
  { slug: "project-manager", title: "Technical Project Manager", department: "Project Management", skills: "Agile, Jira, Delivery Planning, Risk Management", salary: 3000 },
  { slug: "database-administrator", title: "Database Engineer", department: "Database Engineering", skills: "PostgreSQL, SQL, Performance Tuning, Backups", salary: 3200 },
  { slug: "solutions-architect", title: "Solutions Architect", department: "Solutions Architecture", skills: "System Design, Cloud Architecture, APIs, Security", salary: 4200 },
] as const;

export async function seedDemoJobs() {
  const companyIds = new Map<string, number>();

  for (const companyData of demoCompanies) {
    const [existingCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, companyData.slug))
      .limit(1);

    if (existingCompany) {
      if (!existingCompany.isDemo) {
        throw new Error(`Refusing to attach sample jobs to non-demo company "${companyData.slug}".`);
      }
      companyIds.set(companyData.slug, existingCompany.id);
      continue;
    }

    const [createdCompany] = await db
      .insert(companies)
      .values({
        ...companyData,
        isDemo: true,
        verificationStatus: "verified",
        status: "active",
      })
      .returning({ id: companies.id });

    if (!createdCompany) throw new Error(`Failed to create demo company "${companyData.slug}".`);
    companyIds.set(companyData.slug, createdCompany.id);
  }

  const sampleSlugs = demoCompanies.flatMap((company) =>
    roles.map((role) => `sample-${role.slug}-${company.slug}`),
  );
  const existingJobs = await db
    .select({ slug: jobs.slug })
    .from(jobs)
    .where(inArray(jobs.slug, sampleSlugs));
  const existingSlugs = new Set(existingJobs.map((job) => job.slug));
  const publishedAt = new Date();
  const sampleJobs = demoCompanies.flatMap((company, companyIndex) =>
    roles.map((role, roleIndex) => {
      const experienceLevel = (["Junior", "Mid-level", "Senior", "Lead / Architect"] as const)[
        (roleIndex + companyIndex) % 4
      ];
      const experienceYears = experienceLevel === "Junior" ? "1–2" : experienceLevel === "Mid-level" ? "3–5" : "5+";
      const salaryMultiplier = experienceLevel === "Junior" ? 0.75 : experienceLevel === "Lead / Architect" ? 1.4 : 1;
      const salaryMin = Math.round(role.salary * salaryMultiplier / 100) * 100;
      const slug = `sample-${role.slug}-${company.slug}`;

      return {
        companyId: companyIds.get(company.slug)!,
        title: role.title,
        slug,
        department: role.department,
        employmentType: roleIndex % 7 === 0 ? "Contract" : "Full-time",
        remotePolicy: "Remote - Egypt",
        experienceLevel,
        salaryMin,
        salaryMax: salaryMin + 1000,
        salaryCurrency: "EUR",
        timezoneOverlap: `±${1 + (companyIndex % 2)} hours from Cairo`,
        description: `Demo job listing for a ${role.title} to showcase ${role.department} opportunities. This sample is illustrative and does not represent a confirmed vacancy.`,
        responsibilities: `• Deliver work across ${role.skills}.\n• Collaborate with a distributed product and engineering team.\n• Document decisions and communicate progress asynchronously.`,
        requirements: `• ${experienceYears} years of relevant professional experience.\n• Practical experience with ${role.skills}.\n• Clear written communication and ability to work across time zones.`,
        skills: role.skills,
        status: "active" as const,
        isFeatured: roleIndex === 0 && companyIndex === 0,
        publishedAt: new Date(publishedAt.getTime() - (roleIndex + companyIndex) * 86400000).toISOString(),
      };
    }),
  ).filter((job) => !existingSlugs.has(job.slug));

  for (let index = 0; index < sampleJobs.length; index += 15) {
    await db
      .insert(jobs)
      .values(sampleJobs.slice(index, index + 15))
      .onConflictDoNothing({ target: jobs.slug });
  }

  const [total] = await db
    .select({ count: count() })
    .from(jobs)
    .where(inArray(jobs.slug, sampleSlugs));

  console.log(`Added ${sampleJobs.length} demo job listings; ${total?.count ?? 0} generated sample listings are available.`);
  console.log("All generated listings are illustrative demo data, not confirmed vacancies.");
}
