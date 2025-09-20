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
import pool from "./db/pool.js";

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
  origin: true, // Allow all origins for now
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

// Add public routes for frontend (without authentication)
app.get("/dashboard/appointments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY start_ts DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

app.get("/dashboard/announcements", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

app.post("/dashboard/announcements", async (req, res) => {
  try {
    const { message, is_force } = req.body;
    const result = await pool.query(
      "INSERT INTO announcements (message, is_force, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [message, is_force || false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating announcement:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

app.post("/dashboard/announcements/force", async (req, res) => {
  try {
    const { message, is_force } = req.body;
    const result = await pool.query(
      "INSERT INTO announcements (message, is_force, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [message, true]
    );
    
    // For force announcements, you might want to send to all users
    // For now, just return the created announcement
    res.json({
      ...result.rows[0],
      stats: {
        total_users: 0,
        sent_successfully: 0,
        failed: 0
      }
    });
  } catch (err) {
    console.error("Error creating force announcement:", err);
    res.status(500).json({ error: "Failed to create force announcement" });
  }
});

app.get("/dashboard/activities", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM activities ORDER BY activity_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

app.post("/dashboard/activities", async (req, res) => {
  try {
    const { title, description, activity_date, activity_time, location } = req.body;
    const result = await pool.query(
      "INSERT INTO activities (title, description, activity_date, activity_time, location, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [title, description, activity_date, activity_time, location]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating activity:", err);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

app.get("/dashboard/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.post("/dashboard/books", async (req, res) => {
  try {
    const { title, author, price, description, isbn, condition } = req.body;
    const result = await pool.query(
      "INSERT INTO books (title, author, price, description, isbn, condition, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [title, author, price, description, isbn, condition]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});

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