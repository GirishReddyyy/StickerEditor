import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { env } from "./config/env.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import templatesRoutes from "./routes/templates.routes.js";
import stickersRoutes from "./routes/stickers.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Trust proxy for rate limiting behind reverse proxies (Nginx/Cloudflare)
app.set("trust proxy", 1);

// CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// Logging & Body Parsers
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Rate limiting for general API calls
app.use("/api", apiRateLimiter);

// Serve static upload files
const uploadsPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
app.use("/uploads", express.static(uploadsPath));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Sticker Editor Backend", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/stickers", stickersRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[StickerCraft Backend] Running on http://localhost:${env.PORT}`);
  console.log(`[StickerCraft Backend] Client Origin allowed: ${env.CLIENT_ORIGIN}`);
});

export default app;
