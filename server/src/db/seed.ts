import { db } from "./index";
import {
  users,
  companies,
  jobs,
  trainings,
  applications,
  applicationNotes,
  applicationEvents,
  partnershipLeads,
} from "@shared/schema";
import { sql } from "drizzle-orm";

export async function runSeed() {
  console.log("🌱 [Global Bridge] Starting database seeding with realistic Demo data...");

  // 1. Clean existing tables (in foreign-key safe order)
  console.log("🧹 Clearing previous demo records...");
  await db.delete(applicationEvents);
  await db.delete(applicationNotes);
  await db.delete(applications);
  await db.delete(jobs);
  await db.delete(trainings);
  await db.delete(partnershipLeads);
  await db.delete(users);
  await db.delete(companies);

  // 2. Insert Companies (Demo Partners Only)
  console.log("🏢 Seeding 3 Demo Partner Companies...");
  const [northstar] = await db
    .insert(companies)
    .values({
      name: "Northstar Labs",
      slug: "northstar-labs",
      description: "استوديو برمجيات هولندي رائد متخصص في بناء الأنظمة السحابية والمنصات الموزعة عالية الأداء للعملاء في شمال أوروبا.",
      website: "https://northstar-labs.demo",
      country: "Netherlands",
      logoUrl: null,
      isDemo: true,
      verificationStatus: "verified",
      status: "active",
    })
    .returning();

  const [cedarline] = await db
    .insert(companies)
    .values({
      name: "Cedarline Software",
      slug: "cedarline-software",
      description: "شركة تقنية بريطانية ناشئة ومقرها لندن، متخصصة في حلول الـ SaaS والتقنيات المالية الحديثة للشركات المتوسطة.",
      website: "https://cedarline.demo",
      country: "United Kingdom",
      logoUrl: null,
      isDemo: true,
      verificationStatus: "verified",
      status: "active",
    })
    .returning();

  const [atlas] = await db
    .insert(companies)
    .values({
      name: "Atlas Product Studio",
      slug: "atlas-product-studio",
      description: "استوديو هندسي برليني في ألمانيا يركز على بناء وتطوير منصات الأعمال المعقدة والحلول الرقمية للمؤسسات الأوروبية.",
      website: "https://atlas-studio.demo",
      country: "Germany",
      logoUrl: null,
      isDemo: true,
      verificationStatus: "verified",
      status: "active",
    })
    .returning();

  // 3. Insert Users (Admin, Company Leads, Candidates)
  console.log("👤 Seeding Users & Workspaces...");
  const [adminUser] = await db
    .insert(users)
    .values({
      name: "مدير المنصة (Super Admin)",
      email: "admin@globalbridge.demo",
      role: "admin",
      companyId: null,
    })
    .returning();

  const [northstarUser] = await db
    .insert(users)
    .values({
      name: "Sarah King (Northstar Lead)",
      email: "hiring@northstar.demo",
      role: "company",
      companyId: northstar.id,
    })
    .returning();

  const [cedarlineUser] = await db
    .insert(users)
    .values({
      name: "David Miller (Cedarline Recruiter)",
      email: "recruiter@cedarline.demo",
      role: "company",
      companyId: cedarline.id,
    })
    .returning();

  const [atlasUser] = await db
    .insert(users)
    .values({
      name: "Lukas Weber (Atlas Tech Lead)",
      email: "hiring@atlas.demo",
      role: "company",
      companyId: atlas.id,
    })
    .returning();

  // Demo Login Accounts (for Task 11 Authentication)
  console.log("🔑 Seeding Demo Login Accounts...");
  await db.insert(users).values({
    name: "Demo Company (Northstar Labs)",
    email: "demo-company@globalbridge.dev",
    role: "company",
    companyId: northstar.id,
  });

  await db.insert(users).values({
    name: "Demo Admin (Global Bridge)",
    email: "demo-admin@globalbridge.dev",
    role: "admin",
    companyId: null,
  });

  await db.insert(users).values({
    name: "Demo Candidate (مرشح تقني)",
    email: "demo-candidate@globalbridge.dev",
    role: "candidate",
    companyId: null,
  });



  // 4. Insert Jobs (5 Key Jobs Required by Plan)
  console.log("💼 Seeding 5 Tech Jobs...");
  const [backendJob] = await db
    .insert(jobs)
    .values({
      companyId: northstar.id,
      title: "Senior Backend Engineer",
      slug: "senior-backend-engineer-northstar",
      department: "Backend Infrastructure",
      employmentType: "Full-time",
      remotePolicy: "Remote - Egypt",
      experienceLevel: "Senior",
      salaryMin: 3800,
      salaryMax: 5200,
      salaryCurrency: "EUR",
      timezoneOverlap: "±1 hour from Cairo (CEST)",
      description: "نبحث عن مهندس Backend خبير يمتلك شغفاً بتصميم النظم الموزعة وقواعد البيانات للعمل ضمن فريق هندسي عابر للحدود.",
      responsibilities: "• تصميم وبناء وتوثيق REST وGraphQL APIs عالية الأداء.\n• تحسين استعلامات SQL ومعالجة الأحمال العالية عبر Redis.\n• كتابة اختبارات تكاملية والتعاون غير المتزامن مع مهندسي أوروبا.",
      requirements: "• 5+ سنوات خبرة عملية في Node.js وTypeScript.\n• إتقان عميق لـ SQL (PostgreSQL / SQLite) وتصميم الفهارس.\n• إجادة الإنجليزية تحدثاً وكتابة.",
      skills: "Node.js, TypeScript, PostgreSQL, Docker, Redis, REST APIs",
      status: "active",
      isFeatured: true,
      publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    })
    .returning();

  const [frontendJob] = await db
    .insert(jobs)
    .values({
      companyId: cedarline.id,
      title: "Frontend Engineer",
      slug: "frontend-engineer-cedarline",
      department: "Web Application",
      employmentType: "Full-time",
      remotePolicy: "Remote - Egypt",
      experienceLevel: "Mid-level",
      salaryMin: 2800,
      salaryMax: 4000,
      salaryCurrency: "EUR",
      timezoneOverlap: "±2 hours from Cairo (BST)",
      description: "انضم إلى فريق تطوير واجهات تطبيقات الـ SaaS الحديثة لبناء تجارب استخدام تفاعلية فائقة السرعة والجمال.",
      responsibilities: "• تطوير مكونات واجهات استخدام متجاوبة باستخدام React وTypeScript.\n• تطبيق معايير الأداء والـ Web Vitals وسهولة الوصول (Accessibility).\n• الربط السلس مع خدمات الـ Backend ومشاركة الأنواع.",
      requirements: "• 3+ سنوات خبرة مع React وTypeScript الحديث.\n• إتقان مفاهيم State Management وتصميم الواجهات المتجاوبة.\n• حس جمالي عالي واهتمام بالتفاصيل الميكرو-حركية (Micro-animations).",
      skills: "React, TypeScript, Next.js, Modern CSS, Responsive Design",
      status: "active",
      isFeatured: true,
      publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    })
    .returning();

  const [qaJob] = await db
    .insert(jobs)
    .values({
      companyId: atlas.id,
      title: "QA Automation Engineer",
      slug: "qa-automation-engineer-atlas",
      department: "Quality Engineering",
      employmentType: "Full-time",
      remotePolicy: "Remote - Egypt",
      experienceLevel: "Mid-level",
      salaryMin: 3000,
      salaryMax: 4200,
      salaryCurrency: "EUR",
      timezoneOverlap: "±1 hour from Cairo (CEST)",
      description: "بناء وتطوير أطر فحص أوتوماتيكية متطورة تغطي End-to-End وAPI Testing للمنصات الرقمية المعقدة.",
      responsibilities: "• كتابة اختبارات E2E باستخدام Playwright وTypeScript.\n• دمج الفحوصات اليومية ضمن أنابيب CI/CD على GitHub Actions.\n• فحص الأداء وتحديد الاختناقات بالتعاون مع المطورين.",
      requirements: "• خبرة عملية مثبتة في Playwright أو Cypress مع TypeScript.\n• فهم عميق لمسارات الـ CI/CD وفحص الـ Web Services.\n• مهارات تحليلية وتوثيقية ممتازة.",
      skills: "Playwright, TypeScript, CI/CD, Jest, Postman, Test Automation",
      status: "active",
      isFeatured: false,
      publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    })
    .returning();

  const [dataJob] = await db
    .insert(jobs)
    .values({
      companyId: northstar.id,
      title: "Junior Data Analyst",
      slug: "junior-data-analyst-northstar",
      department: "Data & Analytics",
      employmentType: "Full-time",
      remotePolicy: "Remote - Egypt",
      experienceLevel: "Junior",
      salaryMin: 1800,
      salaryMax: 2600,
      salaryCurrency: "EUR",
      timezoneOverlap: "±1 hour from Cairo (CEST)",
      description: "فرصة رائعة للمحللين التقنيين المبتدئين في مصر لتحليل بيانات أداء المنصات واستخراج الرؤى التشغيلية.",
      responsibilities: "• كتابة استعلامات SQL لاستخراج وتجهيز مجموعات البيانات.\n• بناء لوحات متابعة تفاعلية (Dashboards) لمؤشرات الأداء.\n• تنظيف البيانات وتحليلها باستخدام بايثون ومكتبات Pandas.",
      requirements: "• خلفية قوية في SQL وقواعد البيانات العلائقية.\n• إتقان أساسيات Python وPandas.\n• مهارات عرض وتواصل باللغة الإنجليزية.",
      skills: "SQL, Python, Pandas, PowerBI, Data Modeling",
      status: "active",
      isFeatured: false,
      publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    })
    .returning();

  const [devopsJob] = await db
    .insert(jobs)
    .values({
      companyId: cedarline.id,
      title: "DevOps Engineer",
      slug: "devops-engineer-cedarline",
      department: "Cloud Operations",
      employmentType: "Full-time",
      remotePolicy: "Remote - Egypt",
      experienceLevel: "Senior",
      salaryMin: 4200,
      salaryMax: 5600,
      salaryCurrency: "EUR",
      timezoneOverlap: "±2 hours from Cairo (BST)",
      description: "إدارة البنية التحتية السحابية على AWS وأتمتة النشر والمراقبة لمنصات التكنولوجيا المالية سريعة النمو.",
      responsibilities: "• إدارة وتوسيع البنية التحتية باستخدام Terraform وAWS.\n• إعداد وتشغيل مجموعات Kubernetes وبيئات الـ Docker.\n• تعزيز الأمان وتطبيق معايير المراقبة (Observability & Logging).",
      requirements: "• 4+ سنوات خبرة في هندسة الـ Cloud وDevOps.\n• إتقان تام لـ AWS, Docker, Kubernetes, Terraform.\n• خبرة سابقة في أمن الأنظمة الموزعة.",
      skills: "AWS, Docker, Kubernetes, Terraform, GitHub Actions, Linux",
      status: "active",
      isFeatured: true,
      publishedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    })
    .returning();

  // 5. Insert Trainings (2 Programs Required, Clearly Marked Optional)
  console.log("🎓 Seeding 2 Optional Demo Training Programs...");
  await db.insert(trainings).values([
    {
      title: "Remote Engineering Foundations",
      slug: "remote-engineering-foundations",
      providerName: "Global Bridge Academy (Demo)",
      description: "برنامج تدريبي اختياري مستقل لتعلم أفضل ممارسات التواصل غير المتزامن (Async Communication) وهندسة التوثيق وإدارة العمل عن بُعد مع الشركات العالمية.",
      category: "Soft Skills & Engineering Culture",
      level: "Intermediate",
      duration: "4 أسابيع",
      deliveryMode: "Online Cohort",
      isOptional: true,
      isDemo: true,
      status: "published",
    },
    {
      title: "Practical QA Automation Sprint",
      slug: "practical-qa-automation-sprint",
      providerName: "Global Bridge Academy (Demo)",
      description: "تدريب عملي مكثف لتطوير أطر الفحص الآلي للواجهات والـ APIs باستخدام Playwright ودمجها مع خطوط الإنتاج المستمر.",
      category: "Quality Engineering",
      level: "Advanced",
      duration: "6 أسابيع",
      deliveryMode: "Online Cohort",
      isOptional: true,
      isDemo: true,
      status: "published",
    },
  ]);

  // 6. Insert Applications across all 7 stages
  console.log("📝 Seeding Applicants across all 7 Statuses...");
  
  // Status 1: Interview
  const [appAhmed] = await db
    .insert(applications)
    .values({
      jobId: backendJob.id,
      candidateName: "أحمد محمود كمال",
      email: "ahmed.mahmoud@example.com",
      phone: "+201012345678",
      country: "Egypt",
      yearsExperience: 6,
      primaryRole: "Senior Backend Engineer",
      skills: "Node.js, TypeScript, PostgreSQL, Docker, Redis",
      linkedinUrl: "https://linkedin.com/in/ahmed-mahmoud-demo",
      githubUrl: "https://github.com/ahmed-dev-demo",
      portfolioUrl: "https://ahmed-portfolio.demo",
      cvUrl: "https://globalbridge.demo/cv/ahmed-mahmoud.pdf",
      introduction: "مهندس برمجيات متخصص في النظم الموزعة وتصميم قواعد البيانات ذات الأحمال العالية، قمت سابقاً ببناء خدمات معالجة مدفوعات لأكثر من 500 ألف مستخدم نشط.",
      consentAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      trainingInterest: true,
      status: "interview",
    })
    .returning();

  // Status 2: New
  const [appSara] = await db
    .insert(applications)
    .values({
      jobId: frontendJob.id,
      candidateName: "سارة إبراهيم حسن",
      email: "sara.ibrahim@example.com",
      phone: "+201123456789",
      country: "Egypt",
      yearsExperience: 4,
      primaryRole: "Frontend Engineer",
      skills: "React, TypeScript, Next.js, Modern CSS, Web Performance",
      linkedinUrl: "https://linkedin.com/in/sara-dev-demo",
      githubUrl: "https://github.com/sara-frontend-demo",
      portfolioUrl: "https://sara-designs.demo",
      cvUrl: "https://globalbridge.demo/cv/sara-ibrahim.pdf",
      introduction: "مطورة واجهات مهتمة بأدق تفاصيل الأداء وسهولة الوصول والرسوم الحركية، ولدي خبرة 3 سنوات في تطبيقات الـ React المعقدة.",
      consentAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      trainingInterest: false,
      status: "new",
    })
    .returning();

  // Status 3: Shortlisted
  const [appKarim] = await db
    .insert(applications)
    .values({
      jobId: qaJob.id,
      candidateName: "كريم حسن عبد الله",
      email: "karim.hassan@example.com",
      phone: "+201234567890",
      country: "Egypt",
      yearsExperience: 5,
      primaryRole: "QA Automation Engineer",
      skills: "Playwright, TypeScript, CI/CD, Jest, Postman",
      linkedinUrl: "https://linkedin.com/in/karim-qa-demo",
      githubUrl: "https://github.com/karim-qa-demo",
      cvUrl: "https://globalbridge.demo/cv/karim-hassan.pdf",
      introduction: "متخصص في أتمتة اختبارات الجودة مع تركيز خاص على Playwright ودمج الاختبارات في GitHub Actions لتقليل زمن النشر.",
      consentAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      trainingInterest: true,
      status: "shortlisted",
    })
    .returning();

  // Status 4: Under Review
  const [appNour] = await db
    .insert(applications)
    .values({
      jobId: dataJob.id,
      candidateName: "نور علي الشريف",
      email: "nour.ali@example.com",
      phone: "+201098765432",
      country: "Egypt",
      yearsExperience: 2,
      primaryRole: "Junior Data Analyst",
      skills: "SQL, Python, Pandas, PowerBI, Statistics",
      linkedinUrl: "https://linkedin.com/in/nour-data-demo",
      githubUrl: "https://github.com/nour-data-demo",
      cvUrl: "https://globalbridge.demo/cv/nour-ali.pdf",
      introduction: "خريجة هندسة برمجيات شغوفة بتحليل البيانات وصناعة لوحات التحكم الذكية لدعم اتخاذ القرار في الشركات الرقمية.",
      consentAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      trainingInterest: true,
      status: "under_review",
    })
    .returning();

  // Status 5: Offer
  const [appOmar] = await db
    .insert(applications)
    .values({
      jobId: devopsJob.id,
      candidateName: "عمر طارق فهمي",
      email: "omar.tarek@example.com",
      phone: "+201155443322",
      country: "Egypt",
      yearsExperience: 7,
      primaryRole: "Senior DevOps Engineer",
      skills: "AWS, Kubernetes, Terraform, Docker, CI/CD, Linux",
      linkedinUrl: "https://linkedin.com/in/omar-devops-demo",
      githubUrl: "https://github.com/omar-cloud-demo",
      cvUrl: "https://globalbridge.demo/cv/omar-tarek.pdf",
      introduction: "مهندس بنية تحتية سحابية ذو خبرة في إدارة المئات من الحاويات وضمان توافر 99.99% للخدمات الحيوية.",
      consentAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      trainingInterest: false,
      status: "offer",
    })
    .returning();

  // Status 6: Hired
  const [appMona] = await db
    .insert(applications)
    .values({
      jobId: backendJob.id,
      candidateName: "منى يوسف رضوان",
      email: "mona.youssef@example.com",
      phone: "+201011223344",
      country: "Egypt",
      yearsExperience: 8,
      primaryRole: "Staff Backend Engineer",
      skills: "Node.js, TypeScript, Go, Distributed Systems, Microservices",
      linkedinUrl: "https://linkedin.com/in/mona-tech-demo",
      githubUrl: "https://github.com/mona-backend-demo",
      cvUrl: "https://globalbridge.demo/cv/mona-youssef.pdf",
      introduction: "مهندسة برمجيات رائدة ذات خبرة واسعة في قيادة وتصميم الهياكل البرمجية المعقدة للشركات الناشئة والدولية.",
      consentAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      trainingInterest: false,
      status: "hired",
    })
    .returning();

  // Status 7: Rejected
  const [appTarek] = await db
    .insert(applications)
    .values({
      jobId: frontendJob.id,
      candidateName: "طارق فؤاد منصور",
      email: "tarek.fouad@example.com",
      phone: "+201299887766",
      country: "Egypt",
      yearsExperience: 1,
      primaryRole: "Frontend Developer",
      skills: "HTML, CSS, Basic JavaScript",
      cvUrl: "https://globalbridge.demo/cv/tarek-fouad.pdf",
      introduction: "مطور مبتدئ يتطلع لاكتساب الخبرة وتطوير المهارات في بيئة عمل دولية.",
      consentAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      trainingInterest: true,
      status: "rejected",
    })
    .returning();

  // 7. Insert Application Notes (Internal Team Evaluations)
  console.log("💬 Seeding Internal Application Notes...");
  await db.insert(applicationNotes).values([
    {
      applicationId: appAhmed.id,
      authorUserId: northstarUser.id,
      body: "تمت مراجعة حساب GitHub، الكود نظيف جداً وتوجد مساهمات قوية في مشاريع مفتوحة المصدر. مرشح مثالي للمقابلة التقنية الأولى.",
    },
    {
      applicationId: appAhmed.id,
      authorUserId: northstarUser.id,
      body: "أجرينا المقابلة الفنية الأولية، التحدث بالإنجليزية ممتاز والفهم المعماري لـ Node.js استثنائي. تم نقله لمقابلة الـ System Design.",
    },
    {
      applicationId: appOmar.id,
      authorUserId: cedarlineUser.id,
      body: "اجتاز جميع مراحل المقابلات بنجاح باهر. تم تجهيز العرض المالي براتب 5,000 EUR ونحن بانتظار توقيع العقد.",
    },
    {
      applicationId: appMona.id,
      authorUserId: northstarUser.id,
      body: "تم توقيع العقد الرسمي وبدأت مرحلة الـ Onboarding بنجاح. إضافة ممتازة للفريق!",
    },
    {
      applicationId: appTarek.id,
      authorUserId: cedarlineUser.id,
      body: "مستوى الخبرة الحالي أقل من متطلبات الوظيفة الشاغرة (نحتاج مطور Mid-level أو أعلى). تم إرسال رسالة اعتذار لطيفة مع اقتراح التسجيل في البرامج التدريبية الاختيارية.",
    },
  ]);

  // 8. Insert Application Events (Full Timeline History for ATS Audit)
  console.log("⏱️ Seeding Audit Events History...");
  await db.insert(applicationEvents).values([
    // Events for Ahmed
    {
      applicationId: appAhmed.id,
      actorUserId: null,
      fromStatus: null,
      toStatus: "new",
      note: "تقديم الطلب المباشر من قبل المرشح عبر البوابة العامة.",
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      applicationId: appAhmed.id,
      actorUserId: northstarUser.id,
      fromStatus: "new",
      toStatus: "under_review",
      note: "بدء فحص السيرة الذاتية وحساب GitHub.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      applicationId: appAhmed.id,
      actorUserId: northstarUser.id,
      fromStatus: "under_review",
      toStatus: "shortlisted",
      note: "إضافة المرشح إلى القائمة المختصرة بعد اجتياز الفرز الأولي.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      applicationId: appAhmed.id,
      actorUserId: northstarUser.id,
      fromStatus: "shortlisted",
      toStatus: "interview",
      note: "جدولة المقابلة التقنية الأولى عبر Google Meet.",
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },

    // Events for Mona (Full cycle to hired)
    {
      applicationId: appMona.id,
      actorUserId: null,
      fromStatus: null,
      toStatus: "new",
      note: "استلام طلب التقديم.",
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      applicationId: appMona.id,
      actorUserId: northstarUser.id,
      fromStatus: "new",
      toStatus: "shortlisted",
      note: "ملف قوي جداً - نقل مباشر للمقابلة.",
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      applicationId: appMona.id,
      actorUserId: northstarUser.id,
      fromStatus: "shortlisted",
      toStatus: "interview",
      note: "إجراء مقابلتين تقنيتين ومقابلة توافق ثقافي.",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      applicationId: appMona.id,
      actorUserId: northstarUser.id,
      fromStatus: "interview",
      toStatus: "offer",
      note: "إرسال عرض العمل الرسمي.",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      applicationId: appMona.id,
      actorUserId: northstarUser.id,
      fromStatus: "offer",
      toStatus: "hired",
      note: "توقيع العرض واعتماد التعيين الرسمي.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ]);

  // 9. Insert Partnership Leads
  console.log("🤝 Seeding Sample Partnership Leads...");
  await db.insert(partnershipLeads).values([
    {
      companyName: "Nordic Tech Ventures",
      workEmail: "contact@nordictech.demo",
      country: "Sweden",
      companySize: "11 - 50",
      rolesNeeded: "Senior React Native Developers, DevOps",
      hiringVolume: "3 - 5 مطورين",
      message: "نحن مهتمون جداً بفتح مسار توظيف مستمر للمطورين المصريين للعمل عن بُعد مع مقرنا في ستوكهولم.",
      status: "new",
    },
    {
      companyName: "FinScale Dynamics",
      workEmail: "hiring@finscale.demo",
      country: "Germany",
      companySize: "50 - 200",
      rolesNeeded: "Backend Engineers (Go / Python), Security",
      hiringVolume: "فريق كامل (8 مطورين)",
      message: "نريد عقد اجتماع تعريفي لبحث آليات التعاقد والدعم في المقابلات الأولية.",
      status: "contacted",
    },
  ]);

  console.log("✨ [Global Bridge] Database successfully seeded with 3 companies, 5 jobs, 2 trainings, 7 applicants, and full audit logs!");
}

// Execute seed
runSeed()
  .then(() => {
    console.log("✅ Seed completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed with error:", err);
    process.exit(1);
  });
