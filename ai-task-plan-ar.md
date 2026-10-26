# Global Bridge — خطة بناء المشروع من الصفر باستخدام AI Tasks

هذه الخطة ليست قائمة Features فقط. هي مسار تنفيذ كامل يبدأ من مشروع فارغ وينتهي بـ MVP قابل للمعاينة والتجربة. نفّذ المهام بالترتيب، ولا تنتقل إلى المهمة التالية قبل تحقق مخرجات المهمة الحالية.

## وصف المشروع الثابت

Global Bridge منصة توظيف دولية متخصصة في ربط الشركات الأجنبية بالمواهب التقنية المصرية للعمل عن بُعد. يجب أن تكون الهوية مصرية بوضوح، لكن بمظهر عالمي احترافي يصلح أمام شركات أوروبا وأمريكا.

المنتج الأساسي هو التوظيف، وليس التدريب. توجد وظائف يمكن للمرشحين التقدم إليها مباشرة، ويمكن عرض تدريبات اختيارية منفصلة. التدريب لا يشترط التقدم للوظيفة ولا يجب تقديمه كضمان للتوظيف.

في أول نسخة يمكن استخدام شركات وبيانات تجريبية، لكن كل شركة أو وظيفة تجريبية يجب أن تحمل بوضوح إحدى العلامات التالية: `Demo Partner` أو `Sample Data` أو `بيانات تجريبية`. ممنوع استخدام شركات حقيقية أو شعاراتها أو الادعاء بوجود شراكة معها.

## قواعد إلزامية لكل AI Task

```text
قبل التنفيذ:
1. اقرأ الملفات الحالية وافهم بنية المشروع قبل تعديلها.
2. لا تبدأ من الصفر إذا كان هناك كود يعمل بالفعل.
3. لا تحذف ميزة موجودة إلا إذا طلبت المهمة ذلك صراحة.
4. استخدم TypeScript وطرق المشروع الحالية.
5. قسّم الكود إلى ملفات ومكونات وخدمات مفهومة.
6. لا تستخدم شركات أو شعارات حقيقية كبيانات Demo.
7. التدريب optional وليس شرطًا للتقديم أو التوظيف.
8. لا تضع أسرارًا أو مفاتيح API داخل الكود أو الواجهة.
9. بعد المهمة شغّل الفحوصات المناسبة وأصلح أخطاء المهمة الحالية فقط.
10. في نهاية الرد استخدم نموذج الحالة الموجود في آخر هذا الملف.
```

---

# المرحلة الأولى: تأسيس المشروع

## Task 01 — تحليل المتطلبات وكتابة Product Brief

### Prompt

```text
أنت Product Manager ومهندس Full-Stack. قبل كتابة أي كود، حلّل مشروع Global Bridge.

اكتب ملف product-brief.md يشرح:
- المشكلة التي يحلها المنتج.
- المستخدمين الرئيسيين: Candidate وCompany وAdmin.
- ما الذي يدخل في MVP وما الذي لن يدخل فيه.
- رحلة المرشح من دخول الموقع حتى التقديم.
- رحلة الشركة من تسجيل الشراكة حتى إدارة المتقدمين.
- رحلة Admin في إدارة المنصة.
- أن التدريب خدمة اختيارية منفصلة.
- أن شركات وبيانات MVP قد تكون Demo فقط.
- مؤشرات نجاح أولية للمنتج.

لا تنفذ صفحات أو قاعدة بيانات الآن. الهدف هو تثبيت النطاق ومنع التوسع غير المنضبط.
```

### الناتج المطلوب

`product-brief.md` يحتوي على نطاق واضح للمشروع.

---

## Task 02 — فحص البيئة واختيار Architecture

### Prompt

```text
افحص المشروع الحالي أو المجلد الفارغ بالكامل.

تحقق من:
- Node وpnpm.
- package.json.
- React/Vite أو framework المستخدم.
- TypeScript.
- server.
- database.
- routing.
- authentication الموجودة.
- environment variables.
- أوامر dev وbuild وcheck.

اكتب ملف architecture.md يحدد:
- Frontend stack.
- Backend stack.
- Database stack.
- API style: tRPC أو REST حسب المشروع.
- Authentication approach للـMVP.
- طريقة تنظيم folders.
- طريقة تشغيل المشروع.
- طريقة migrations وseed.
- ما الذي يحتاج secrets وما الذي لا يحتاجها.

لا تضف dependencies جديدة إلا إذا كانت ضرورية فعلًا.
```

### الناتج المطلوب

`architecture.md` وتقرير واضح عن حالة المشروع الحالية.

---

## Task 03 — تهيئة المشروع وتشغيل صفحة البداية

### Prompt

```text
جهّز مشروع Global Bridge ليكون قابلًا للتشغيل من الصفر.

نفّذ فقط الأساسيات:
- تأكد من package.json وscripts.
- تأكد من تشغيل dev server على 0.0.0.0 ويستخدم PORT مع fallback إلى 3000.
- تأكد من وجود صفحة React رئيسية تعمل.
- تأكد من وجود server عند الحاجة.
- أضف endpoint صحة غير محمي مثل /api/health يعيد HTTP 200.
- أضف أو حدّث README مبدئيًا بأوامر التثبيت والتشغيل.
- أنشئ public/manus-routes.json بالمسار الرئيسي /.

لا تنفذ dashboards أو قاعدة بيانات الأعمال في هذه المهمة.

شغّل:
- pnpm check إن كان متاحًا.
- pnpm build إن كان متاحًا.
```

### الناتج المطلوب

مشروع يبدأ ويعرض صفحة أولية، و`/api/health` يعمل، وbuild أساسي ناجح.

---

## Task 04 — إعداد Git وملفات المشروع الأساسية

### Prompt

```text
جهّز ملفات المشروع الأساسية التي يحتاجها فريق تطوير حقيقي.

أنشئ أو حدّث:
- .gitignore.
- .env.example بدون قيم سرية.
- README.md مبدئي.
- plan.md يلخص خطة التنفيذ.
- TODO.md يتضمن المهام المتبقية.
- بنية folders واضحة للـclient والـserver والـshared.

لا تضع credentials حقيقية.
لا تنفذ منطق المنتج بعد، فقط اجعل المشروع منظمًا وقابلًا للتطوير الجماعي.
```

### الناتج المطلوب

مستودع منظم مع ملفات التشغيل والتوثيق الأساسية.

---

# المرحلة الثانية: التصميم والـFrontend Foundation

## Task 05 — تصميم الهوية المصرية واللوجو والـDesign System

### Prompt

```text
أنشئ هوية بصرية مصرية جذابة ومميزة لمنصة Global Bridge، مع الحفاظ على الثقة والاحتراف المناسبين للشركات الدولية.

استخدم الصورة المرجعية التي قدمها المستخدم كمرجع للروح البصرية فقط، وليس لنسخها. استلهم منها:
- حضور الخط العربي القوي.
- الإحساس بالحركة والعبور والسفر.
- دمج رمز بصري داخل أو بجانب الكلمة.
- التباين بين الأزرق العميق والذهبي/الأصفر.
- لوجو واضح يعمل على الموقع وLinkedIn وfavicon وحجم الهاتف.

### اتجاه الهوية

قدّم Global Bridge كعلامة مصرية تصل بين القاهرة والعالم. يمكن استخدام جسر مبسط، مسار ذهبي، سهم حركة، أو رمز اتصال مجرد. لا تستخدم الأهرامات أو أبو الهول كزخرفة مباشرة إلا إذا تم تبسيطها بشكل ذكي جدًا؛ الأولوية للتكنولوجيا والفرص والعبور المهني، وليس للسياحة.

### لوحة الألوان

- Nile Blue: `#07549A` أو درجة قريبة منه للثقة.
- Egypt Gold: `#F4B400` للحركة والطموح.
- Cairo Ink: `#10233F` للنصوص.
- Sand White: `#FFFDF8` للخلفيات الدافئة.
- ألوان status هادئة ومنفصلة عن ألوان الهوية.

اختبر contrast على الخلفيات الفاتحة والداكنة. لا تجعل الذهبي لون كل الأزرار؛ استخدمه كعنصر إبراز ومسار بصري.

### تصميم اللوجو

أنشئ 3 اتجاهات أولية مختلفة، ثم اختر الأفضل:

1. **Arabic-forward mark:** معالجة عربية مبتكرة للاسم أو lockup عربي/إنجليزي، مع خط ذهبي يعبر بين الحروف.
2. **Bridge + route mark:** قوس أو جسر هندسي يتصل بمسار ذهبي متحرك مع wordmark Global Bridge.
3. **Egypt-to-world mark:** رمز مجرد لنقطة انطلاق مصرية واتصال عالمي دون استخدام خريطة سياسية أو أيقونة طائرة جاهزة.

لكل اتجاه اشرح سبب الاختيار، درجة تميزه، وقابليته للعمل بحجم صغير. اختر اتجاهًا واحدًا للتنفيذ.

المخرجات النهائية:
- نسخة أفقية.
- نسخة compact للـfavicon وavatar.
- نسخة فاتحة ونسخة داكنة.
- mark منفصل بدون نص.
- wordmark إنجليزي واضح.
- نسخة عربية أو lockup عربي/إنجليزي إذا كانت القراءة سليمة.
- SVG أو CSS/SVG قابل للتكبير، وليس صورة raster منخفضة الجودة.

ممنوع:
- نسخ اللوجو الموجود في الصورة المرجعية.
- استخدام طائرة أو أيقونة جاهزة كهوية أساسية.
- كتابة Global Bridge بخط افتراضي فقط واعتبارها لوجو نهائيًا.
- استخدام علم مصر حرفيًا بطريقة توحي بأن العلامة حكومية أو سياسية.

### أسلوب الواجهة

- استخدم Sand White مع مساحات بيضاء مريحة.
- استخدم Nile Blue وCairo Ink للعناوين والنصوص.
- استخدم Egypt Gold في المسارات، التفاصيل، وCTA محدودة.
- أضف motifs بسيطة مستوحاة من مسار النيل أو خطوط الخرائط أو الأقواس الهندسية المصرية المعاصرة.
- التصميم يجب أن يكون attractive وموثوقًا، وليس folkloric أو سياحيًا.
- استخدم حركة خفيفة لمسار الجسر عند hover وظهور ناعم للبطاقات.

### الخطوط

- الإنجليزية: Inter أو Plus Jakarta Sans أو Manrope.
- العربية: IBM Plex Sans Arabic أو Cairo أو Noto Kufi Arabic.
- استخدم الخط العربي المميز في اللوجو أو العناوين القصيرة فقط، وليس في الفقرات الطويلة.

نفّذ components قابلة لإعادة الاستخدام:
- Header.
- Footer.
- Container.
- Button.
- Card.
- Badge.
- Input.
- Select.
- Textarea.
- Modal أو Drawer.
- Table.
- Status pill.
- Toast.
- Loading skeleton.
- Empty state.
- Error state.
- Mobile navigation.

أنشئ شعارًا حقيقيًا قابلًا لإعادة الاستخدام في Header وFooter وfavicon/metadata إن أمكن، باستخدام SVG أو CSS/SVG محلي. يجب أن يكون مصممًا وفق الاتجاه المختار أعلاه وليس مجرد نص باسم Global Bridge.

اكتب داخل plan.md قسمًا بعنوان `Egyptian Brand Direction` يثبت الألوان والرموز واتجاه اللوجو المختار، مع توضيح أن الصورة المرجعية استُخدمت للإلهام البصري فقط.

اجعل التصميم responsive، لكن لا تبنِ صفحات المنتج النهائية في هذه المهمة.
```

### الناتج المطلوب

Design system عام يمكن استخدامه في كل الصفحات.

---

## Task 06 — إعداد Routing وLayout العام

### Prompt

```text
أنشئ routing structure للمشروع دون تنفيذ منطق البيانات بعد.

أنشئ المسارات العامة:
- /
- /jobs
- /jobs/:id
- /jobs/:id/apply
- /training
- /training/:id
- /companies
- /about
- /login

والمسارات الخاصة:
- /company/dashboard
- /company/jobs
- /company/jobs/new
- /company/jobs/:id/edit
- /company/applicants
- /company/applicants/:id
- /admin
- /admin/companies
- /admin/jobs
- /admin/applicants
- /admin/training
- /admin/activity

استخدم placeholder pages منظمة بدل ترك المسارات مكسورة.
أضف Header وFooter للموقع العام، وSidebar أو shell للوحات التحكم.
أضف route manifest كاملًا في public/manus-routes.json.
```

### الناتج المطلوب

كل routes تفتح صفحات مؤقتة سليمة، مع Layout عام وDashboard shell.

---

# المرحلة الثالثة: قاعدة البيانات والبيانات التجريبية

## Task 07 — تصميم Database Schema

### Prompt

```text
نفّذ قاعدة البيانات الخاصة بـ Global Bridge باستخدام ORM الموجود في المشروع.

أنشئ الجداول والعلاقات التالية:

users:
- id
- name
- email
- role: candidate أو company أو admin
- companyId nullable
- createdAt
- updatedAt

companies:
- id
- name
- slug
- description
- website
- country
- logoUrl nullable
- isDemo
- verificationStatus
- status
- createdAt
- updatedAt

jobs:
- id
- companyId
- title
- slug
- department
- employmentType
- remotePolicy
- experienceLevel
- salaryMin nullable
- salaryMax nullable
- salaryCurrency nullable
- timezoneOverlap nullable
- description
- responsibilities
- requirements
- skills
- status: draft أو active أو paused أو closed
- isFeatured
- publishedAt nullable
- deadline nullable
- createdAt
- updatedAt

trainings:
- id
- title
- slug
- providerName
- description
- category
- level
- duration
- deliveryMode
- isOptional default true
- isDemo
- status
- createdAt
- updatedAt

applications:
- id
- jobId
- candidateName
- email
- phone nullable
- country
- yearsExperience
- primaryRole
- skills
- linkedinUrl nullable
- githubUrl nullable
- portfolioUrl nullable
- cvUrl nullable
- introduction
- consentAt
- trainingInterest
- status: new أو under_review أو shortlisted أو interview أو offer أو hired أو rejected
- createdAt
- updatedAt

applicationNotes:
- id
- applicationId
- authorUserId
- body
- createdAt

applicationEvents:
- id
- applicationId
- actorUserId nullable
- fromStatus nullable
- toStatus
- note nullable
- createdAt

partnershipLeads:
- id
- companyName
- workEmail
- country
- companySize nullable
- rolesNeeded
- hiringVolume nullable
- message nullable
- status
- createdAt

أضف العلاقات والـtypes والـindexes الضرورية.
أنشئ migration مناسبة.
لا تنفذ صفحات أو API في هذه المهمة.
```

### الناتج المطلوب

Schema وrelations وmigration وtypes بدون أخطاء.

---

## Task 08 — إنشاء Seed Data وتشغيلها

### Prompt

```text
أنشئ seed data للـMVP، مع استخدام شركات خيالية فقط.

الشركات:
- Northstar Labs — Demo Partner — Netherlands
- Cedarline Software — Demo Partner — United Kingdom
- Atlas Product Studio — Demo Partner — Germany

الوظائف:
- Senior Backend Engineer — Node.js / TypeScript
- Frontend Engineer — React / TypeScript
- QA Automation Engineer — Playwright
- Junior Data Analyst — SQL / Python
- DevOps Engineer — AWS / Docker

التدريبات:
- Remote Engineering Foundations — Optional / Demo Program
- Practical QA Automation Sprint — Optional / Demo Program

أنشئ متقدمين بمراحل:
New، Under review، Shortlisted، Interview، Offer، Hired، Rejected.

أنشئ application events وnotes كي تظهر اللوحات بشكل واقعي.
اجعل كل البيانات التجريبية قابلة للتمييز، ولا تستخدم شعارات أو بيانات شركات حقيقية.
أضف أمر تشغيل واضحًا للـseed في README.
```

### الناتج المطلوب

Seed قابل للتشغيل، وبيانات تظهر في قاعدة البيانات، وتعليمات موثقة.

---

# المرحلة الرابعة: Backend وAPI

## Task 09 — طبقة Database Services

### Prompt

```text
أنشئ طبقة services منفصلة للتعامل مع قاعدة البيانات.

أنشئ functions واضحة لـ:
- jobs: list active, get by slug, create, update, change status.
- companies: list, get, create, update, change status.
- trainings: list public, get by slug, create, update.
- applications: create, list, get, update status.
- notes: add and list.
- events: create and list.
- partnership leads: create and list.
- dashboard statistics.

لا تضع استعلامات قاعدة البيانات داخل React components.
استخدم types المستخرجة من schema.
أضف pagination أو limits مناسبة للقوائم.
```

### الناتج المطلوب

Services قابلة لإعادة الاستخدام بدون ربط مباشر بالواجهة.

---

## Task 10 — Public API

### Prompt

```text
أنشئ Public API typed لمنصة Global Bridge باستخدام أسلوب المشروع الحالي.

العمليات المطلوبة:
- listActiveJobs(filters)
- getJobBySlug(slug)
- createApplication(input)
- listPublicTrainings(filters)
- getTrainingBySlug(slug)
- createPartnershipLead(input)
- getPublicStats()

طبّق validation.

الشروط:
- لا يظهر للزائر إلا active jobs وpublished trainings.
- لا يمكن التقديم على وظيفة غير نشطة.
- email وURLs يتم التحقق منها.
- consentAt إلزامي.
- منع التقديم المكرر لنفس البريد على نفس الوظيفة أو رسالة مناسبة.
- لا تسجل بيانات شخصية حساسة في logs.
- لا تعد المرشح بوظيفة أو مقابلة.
```

### الناتج المطلوب

Public API يعمل ويمكن اختباره بدون واجهة.

---

## Task 11 — Authentication وRole Permissions

### Prompt

```text
نفّذ Authentication أو Demo Authentication حسب إمكانيات المشروع الحالي.

الأدوار:
- Candidate.
- Company.
- Admin.

يجب توفير Demo Company Workspace وDemo Admin Workspace مع Banner واضح:
Demo workspace — sample data only.

نفّذ:
- login.
- logout.
- session/current user.
- role guards.
- company ownership checks.
- admin checks.

الشروط:
- Candidate لا يصل إلى dashboards.
- Company لا يرى إلا وظائف ومتقدمين تابعين لشركته.
- Admin يرى كل البيانات.
- لا تعتمد على إخفاء الرابط فقط؛ تحقق من الصلاحيات في backend أيضًا.
```

### الناتج المطلوب

Authentication أو Demo Login يعمل مع حماية backend وfrontend.

---

## Task 12 — Company وAdmin API

### Prompt

```text
أكمل API الخاصة باللوحات.

Company operations:
- getCompanyDashboard()
- listOwnJobs()
- createJob(input)
- updateJob(id, input)
- changeJobStatus(id, status)
- listOwnApplicants(filters)
- getApplicant(id)
- changeApplicantStatus(id, status)
- addApplicantNote(id, note)

Admin operations:
- getAdminDashboard()
- listCompanies(filters)
- createCompany(input)
- updateCompany(id, input)
- changeCompanyStatus(id, status)
- listAllJobs(filters)
- listAllApplications(filters)
- updateApplication(id, input)
- createTraining(input)
- updateTraining(id, input)
- listActivityEvents()

كل تغيير في حالة application يجب أن ينشئ applicationEvent.
تحقق من role وownership لكل operation.
أضف endpoint /api/health إذا لم يكن موجودًا.
```

### الناتج المطلوب

Backend كامل للـpublic وcompany وadmin flows.

---

# المرحلة الخامسة: الموقع العام

## Task 13 — الصفحة الرئيسية والصفحات التسويقية

### Prompt

```text
نفّذ الصفحات العامة التالية باستخدام design system والـAPI:
- /
- /companies
- /about

الصفحة الرئيسية يجب أن تحتوي على:
- Hero: Build your next team across borders.
- وصف عن توظيف المواهب التقنية المصرية عن بُعد.
- CTA للوظائف.
- CTA للشركات.
- How it works بثلاث مراحل.
- Featured jobs من API.
- Optional training من API.
- Demo statistics موسومة بوضوح.
- Footer.

صفحة Companies:
- شرح sourcing وvetting وinterview coordination.
- توضيح أن التدريب optional.
- partnership lead form.
- success وerror states.

صفحة About:
- شرح المشكلة والحل.
- عدم ادعاء شراكات حقيقية.
```

### الناتج المطلوب

صفحات التسويق تعمل وتستخدم البيانات الحقيقية من API.

---

## Task 14 — Jobs وTraining Browsing

### Prompt

```text
نفّذ صفحات استعراض الوظائف والتدريبات:

Jobs:
- /jobs
- /jobs/:id

Training:
- /training
- /training/:id

Jobs page:
- search.
- filters: role, skills, experience, employment type, timezone.
- sort by newest.
- cards responsive.
- company name وDemo Partner badge.
- loading, empty, error states.

Job detail:
- title.
- company.
- employment type.
- remote policy.
- experience.
- salary إن وجدت.
- responsibilities.
- requirements.
- skills.
- Apply now.

Training:
- cards وdetails.
- badge Optional training.
- badge Demo Program عند الحاجة.
- نص ثابت:
Training opportunities are optional and do not replace the direct job application process.
```

### الناتج المطلوب

تصفح الوظائف والتدريبات من البيانات الحقيقية، مع search وfilters وdetails.

---

## Task 15 — Application Flow

### Prompt

```text
نفّذ تجربة التقديم:
- /jobs/:id/apply

الحقول:
- Full name required.
- Email required.
- Phone optional.
- Country required، default Egypt.
- Years of experience required.
- Primary role required.
- Skills required.
- LinkedIn optional.
- GitHub optional.
- Portfolio optional.
- CV URL أو upload إذا كانت Storage جاهزة.
- Short introduction required.
- Consent checkbox required.
- Interest in optional training optional.

نفّذ validation ورسائل خطأ، disable أثناء الحفظ، success state، application reference، ومنع التقديم على وظيفة غير نشطة.

رسالة النجاح:
Application received.
Our team will review your profile and contact you if there is a match.

لا تعرض وعدًا بالوظيفة أو المقابلة.
بعد الحفظ يجب أن يظهر الطلب في Company وAdmin dashboards.
```

### الناتج المطلوب

تقديم فعلي محفوظ في DB ومربوط بالوظيفة.

---

# المرحلة السادسة: لوحات التحكم

## Task 16 — Company Dashboard UI

### Prompt

```text
نفّذ Company Dashboard على المسارات:
- /company/dashboard
- /company/jobs
- /company/jobs/new
- /company/jobs/:id/edit
- /company/applicants
- /company/applicants/:id

أضف Banner:
Demo workspace — sample data only.

Dashboard:
- Active jobs.
- Total applicants.
- New applicants.
- Interviews.
- Offers.
- latest applicants.

Jobs:
- create.
- edit.
- draft.
- publish.
- pause.
- close.
- reactivate.

Applicant management:
- list.
- search.
- filter by job/status.
- profile details.
- change status.
- add internal note.
- timeline of status events.

استخدم API والصلاحيات الموجودة، ولا تستخدم بيانات hardcoded داخل الواجهة إلا fallback واضح.
```

### الناتج المطلوب

شركة Demo تستطيع إنشاء وإدارة وظائفها ورؤية متقدميها وتغيير حالاتهم.

---

## Task 17 — Admin Dashboard UI

### Prompt

```text
نفّذ Admin Dashboard على المسارات:
- /admin
- /admin/companies
- /admin/jobs
- /admin/applicants
- /admin/training
- /admin/activity

Dashboard:
- total companies.
- active companies.
- total jobs.
- active jobs.
- total applicants.
- new applicants.
- interviews.
- offers.
- hired.
- distribution by status.
- jobs by category.
- latest activity.

Companies:
- create.
- edit.
- activate/suspend.
- mark Demo Partner.
- verification status.

Jobs:
- list all.
- filter.
- edit.
- pause/close.
- featured.

Applicants:
- list all.
- filter by company/job/status/role/date.
- view profile.
- change status.
- add notes.
- view event history.

Training:
- create.
- edit.
- publish/hide.
- keep isOptional=true by default.
- mark isDemo.

أضف confirmation للإجراءات الحساسة.
الإحصاءات يجب أن تأتي من API وليس أرقامًا ثابتة.
```

### الناتج المطلوب

لوحة Admin كاملة لإدارة بيانات الـMVP.

---

# المرحلة السابعة: الجودة والتسليم

## Task 18 — Responsive وUX وAccessibility

### Prompt

```text
راجع كل صفحات Global Bridge على Desktop وTablet وMobile.

أصلح:
- horizontal overflow.
- mobile navigation.
- dashboard sidebar.
- tables على الهاتف.
- form columns.
- spacing.
- typography.
- contrast.
- keyboard focus.
- disabled states.
- loading skeletons.
- empty states.
- error states.
- success toasts.

تأكد أن:
- Apply now واضح.
- Demo Partner واضح.
- Optional training واضح.
- لا توجد وعود بوظائف مضمونة.
- لا تظهر بيانات المتقدمين في الصفحات العامة.
- لا توجد صفحة مكسورة بدون بيانات.
```

### الناتج المطلوب

تجربة Responsive وUX قابلة للاستخدام.

---

## Task 19 — Security وData Review

### Prompt

```text
راجع المشروع أمنيًا قبل التسليم.

تحقق من:
- role checks في backend.
- company ownership.
- validation لكل input.
- منع الوصول إلى CV وبيانات المرشحين دون صلاحية.
- عدم وجود secrets في frontend أو Git.
- عدم تسجيل بيانات شخصية حساسة في logs.
- حماية forms من التكرار الواضح.
- رسائل أخطاء لا تكشف تفاصيل قاعدة البيانات.
- روابط CV وLinkedIn يتم التحقق منها.
- صفحات dashboards غير قابلة للفهرسة.

لا تضف منظومة أمنية ضخمة خارج نطاق MVP، لكن أصلح المخاطر الواضحة.
اكتب SECURITY_NOTES.md بالملاحظات والحدود المتبقية.
```

### الناتج المطلوب

مراجعة أمنية موثقة وإصلاح الصلاحيات والبيانات الحساسة.

---

## Task 20 — SEO وRoutes وMetadata

### Prompt

```text
حدّث public/manus-routes.json ليشمل كل المسارات العامة والخاصة.

المسارات العامة:
- /
- /jobs
- /jobs/:id
- /jobs/:id/apply
- /training
- /training/:id
- /companies
- /about
- /login

المسارات الخاصة:
- /company/dashboard
- /company/jobs
- /company/jobs/new
- /company/jobs/:id/edit
- /company/applicants
- /company/applicants/:id
- /admin
- /admin/companies
- /admin/jobs
- /admin/applicants
- /admin/training
- /admin/activity

تأكد أن GET /manus-routes.json يعيد JSON صحيحًا.
أضف title وdescription وOpen Graph basics للصفحات العامة.
ضع noindex للمسارات الخاصة ولوحات التحكم.
```

### الناتج المطلوب

Routes manifest وmetadata صحيحان.

---

## Task 21 — QA شامل وBuild نهائي

### Prompt

```text
نفّذ QA نهائيًا لمشروع Global Bridge.

اختبر هذه الرحلة كاملة:
1. فتح Home.
2. فتح Jobs.
3. استخدام search وfilters.
4. فتح Job details.
5. التقديم بنجاح.
6. ظهور application في DB.
7. ظهور application في Company Dashboard.
8. تغيير status إلى Interview.
9. إضافة note.
10. ظهور event في history.
11. دخول Admin.
12. صحة dashboard statistics.
13. إدارة Demo company.
14. إنشاء وتعديل job.
15. إنشاء training optional.
16. empty state.
17. error state.
18. mobile layout.
19. unauthorized access.
20. 404 للوظيفة غير الموجودة.

شغّل:
- pnpm check
- pnpm build
- pnpm test إن وجد

أنشئ QA_REPORT.md يحتوي على:
- السيناريو.
- النتيجة.
- المشاكل التي تم إصلاحها.
- المشاكل المتبقية.
- خطوات تجربة الـDemo.

لا تدّعِ النجاح إذا فشل أمر أو سيناريو.
```

### الناتج المطلوب

Build وcheck ناجحان أو تقرير صريح بالمشاكل المتبقية.

---

## Task 22 — README والتسليم النهائي

### Prompt

```text
اكتب README.md نهائيًا وحدثه ليكون مناسبًا لمطور جديد.

يجب أن يحتوي على:
- وصف Global Bridge.
- أن المنتج منصة توظيف تقنية دولية.
- أن التدريب optional وليس شرطًا.
- Stack المستخدم.
- install.
- environment variables المطلوبة.
- migrations.
- seed.
- dev server.
- build.
- check.
- endpoint /api/health.
- Demo Company login/workspace.
- Demo Admin login/workspace.
- routes العامة.
- routes الخاصة.
- الصلاحيات.
- تنبيه أن الشركات والوظائف التجريبية ليست شراكات حقيقية.
- تنبيه قانوني بأن المشروع يحتاج مراجعة حماية البيانات والتوظيف والضرائب قبل production.

لا تضع secrets أو credentials حقيقية داخل README.
```

### الناتج المطلوب

README نهائي، وتعليمات تشغيل وتسليم واضحة.

---

# الترتيب النهائي المختصر

```text
01 Product Brief
02 Architecture
03 Project Bootstrap
04 Git and Project Foundation
05 Design System
06 Routing and Layout
07 Database Schema
08 Seed Data
09 Database Services
10 Public API
11 Authentication and Permissions
12 Company/Admin API
13 Marketing Pages
14 Jobs and Training Browsing
15 Application Flow
16 Company Dashboard UI
17 Admin Dashboard UI
18 Responsive UX
19 Security Review
20 SEO and Routes
21 QA and Build
22 README and Handoff
```

# قاعدة الانتقال بين المهام

بعد كل Task يجب أن يجيب الـAI بهذا الشكل:

```text
STATUS: DONE أو BLOCKED
TASK: رقم المهمة واسمها
FILES_CREATED_OR_CHANGED:
- file path
- file path
CHECKS_RUN:
- command: result
IMPLEMENTED:
- ما تم تنفيذه
BLOCKERS:
- none أو المشكلة بالتفصيل
NEXT_TASK:
- رقم المهمة التالية
```

لا تبدأ المهمة التالية إذا كانت الحالة `BLOCKED`، أو إذا كان هناك خطأ غير مفسر في `pnpm check` أو `pnpm build`.
