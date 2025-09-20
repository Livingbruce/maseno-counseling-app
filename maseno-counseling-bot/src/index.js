import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";

import appointmentsRoutes from "./routes/appointments.js";
import booksRoutes from "./routes/books.js";
import bot from "./bot.js";
import { scheduleReminders } from "./scheduler.js";
import slotsRoutes from "./routes/slots.js";
import dashboardRoutes from "./routes/dashboard.js";
import announcementsRoutes from "./routes/announcements.js";
import authRoutes from "./routes/auth.js";
import activitiesRoutes from "./routes/activities.js";
import recentActivityRoutes from "./routes/recentActivity.js";

// Security middleware
import { 
  generalLimiter, 
  authLimiter, 
  sanitizeInput, 
  detectAISpam, 
  securityLogger,
  validateTokenStrength 
} from "./middleware/security.js";
import { detectAIMessages, rateLimitBotMessages } from "./middleware/aiDetection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Security middleware (order matters!)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use(generalLimiter);

// Slow down repeated requests
app.use(slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  }
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(sanitizeInput);

// AI/Spam detection
app.use(detectAISpam);

// Security logging
app.use(securityLogger);

// Token validation
app.use(validateTokenStrength);

// Logging
app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.json({ 
    message: "Maseno Counseling Bot API", 
    status: "running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      appointments: "/api/appointments",
      books: "/api/books",
      activities: "/api/activities",
      announcements: "/api/announcements",
      dashboard: "/api/dashboard",
      slots: "/api/slots"
    }
  });
});

app.use("/api/announcements", announcementsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/slots", slotsRoutes);
app.use("/api/recent-activity", recentActivityRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });

  // Only start bot if not in Vercel environment (bot needs separate hosting)
  if (process.env.BOT_TOKEN) {
    bot.launch()
      .then(() => {
        console.log("✅ Telegram bot started successfully");
        console.log("Bot token:", process.env.BOT_TOKEN ? "Present" : "Missing");
      })
      .catch((err) => {
        console.error("❌ Failed to start Telegram bot:", err);
        console.error("Bot token:", process.env.BOT_TOKEN ? "Present" : "Missing");
      });

    scheduleReminders(bot);
  }
}

// Export for Vercel
export default app;