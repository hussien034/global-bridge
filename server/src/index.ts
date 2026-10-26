import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { HealthCheckResponse } from "@shared/types";
import { publicRouter } from "./routes/public.routes";
import { companyRouter } from "./routes/company.routes";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { sessionMiddleware } from "./middleware/auth.middleware";
import { bootstrapAdminAccount } from "./auth/bootstrap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.resolve(__dirname, "public"));

app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "7mb" }));
app.use(cookieParser());

// Global session middleware — attaches req.sessionUser if token is valid
app.use(sessionMiddleware);

// 1. Unprotected Health Check Endpoint
app.get("/api/health", (_req, res) => {
  const healthData: HealthCheckResponse = {
    status: "ok",
    service: "global-bridge",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  };
  res.status(200).json(healthData);
});

// 2. Mount Auth API
app.use("/api/auth", authRouter);

// 3. Mount Public API
app.use("/api/public", publicRouter);

// 4. Mount Company API (requires company or admin role)
app.use("/api/company", companyRouter);

// 5. Mount Admin API (requires admin role)
app.use("/api/admin", adminRouter);

// 4. Client Serving (Dev Vite Middleware vs. Production Static)

async function startServer() {
  await bootstrapAdminAccount();

  if (!isProduction) {
    // Dynamic import to avoid vite bundling issues in production
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "../../client"),
    });

    app.use(vite.middlewares);
    console.log("[Global Bridge] Vite development middleware initialized.");
  } else {
    const distPublic = path.resolve(__dirname, "public");
    if (fs.existsSync(distPublic)) {
      app.use(express.static(distPublic));
      app.get("*", (_req, res) => {
        res.sendFile(path.resolve(distPublic, "index.html"));
      });
    } else {
      console.warn(`[Global Bridge] Static directory ${distPublic} not found. Running in API-only mode.`);
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`  🚀 Global Bridge Server running at http://${HOST}:${PORT}`);
    console.log(`  🟢 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  🌐 Environment: ${isProduction ? "production" : "development"}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error("[Global Bridge] Failed to start server:", err);
  process.exit(1);
});
