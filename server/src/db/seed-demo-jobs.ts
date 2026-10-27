import { seedDemoJobs } from "./demo-jobs";

seedDemoJobs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Demo job seeding failed:", error);
    process.exit(1);
  });
