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
  origin: [
    'https://maseno-counseling-bot.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
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

app.get("/dashboard/support/tickets", async (req, res) => {
  try {
    console.log("📋 Support tickets endpoint called");
    
    // Simple query first to test
    const result = await pool.query("SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 10");
    
    console.log("📊 Found tickets:", result.rows.length);
    
    res.json({ 
      success: true, 
      tickets: result.rows,
      message: "Support tickets endpoint working"
    });
  } catch (err) {
    console.error("Error fetching support tickets:", err);
    res.status(500).json({ error: "Failed to fetch support tickets", details: err.message });
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
    
    // Import and use broadcastMessage function
    const { broadcastMessage } = await import('./bot.js');
    
    // Broadcast the message to all users
    const broadcastResult = await broadcastMessage(`📢 **URGENT ANNOUNCEMENT**\n\n${message}`);
    
    res.json({
      ...result.rows[0],
      stats: {
        total_users: broadcastResult.totalUsers,
        sent_successfully: broadcastResult.sentCount,
        failed: broadcastResult.failedCount
      }
    });
  } catch (err) {
    console.error("Error creating force announcement:", err);
    res.status(500).json({ error: "Failed to create force announcement" });
  }
});

// DELETE announcement
app.delete("/dashboard/announcements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM announcements WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json({ success: true, message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// PUT announcement
app.put("/dashboard/announcements/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_force } = req.body;
    const result = await pool.query(
      "UPDATE announcements SET message = $1, is_force = $2, created_at = NOW() WHERE id = $3 RETURNING *",
      [message, is_force || false, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating announcement:", err);
    res.status(500).json({ error: "Failed to update announcement" });
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
    
    // Ensure we have required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    // Use provided values or defaults
    const activityDate = activity_date || new Date().toISOString().split('T')[0];
    const activityTime = activity_time || '09:00';
    
    console.log('Creating activity with data:', {
      title,
      description: description || '',
      counselor_id: 2,
      activity_date: activityDate,
      activity_time: activityTime
    });
    
    // Insert with actual schema columns
    const result = await pool.query(
      "INSERT INTO activities (title, description, counselor_id, activity_date, activity_time, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [title, description || '', 2, activityDate, activityTime]
    );
    
    console.log('Activity created successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating activity:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ error: "Failed to create activity", details: err.message });
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
    const { title, author, price, pickup_station } = req.body;
    
    if (!title || !author || !price) {
      return res.status(400).json({ error: "Title, author, and price are required" });
    }
    
    const price_cents = Math.round(price * 100); // Convert to cents
    const result = await pool.query(
      "INSERT INTO books (title, author, price_cents, pickup_station, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [title, author, price_cents, pickup_station || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(500).json({ error: "Failed to create book" });
  }
});

// Appointment management endpoints
app.post("/dashboard/appointments/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ success: true, message: "Appointment cancelled successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

app.post("/dashboard/appointments/:id/postpone", async (req, res) => {
  try {
    const { id } = req.params;
    const { new_start_ts, new_end_ts } = req.body;
    const result = await pool.query(
      "UPDATE appointments SET start_ts = $1, end_ts = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [new_start_ts, new_end_ts, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ success: true, message: "Appointment postponed successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error("Error postponing appointment:", err);
    res.status(500).json({ error: "Failed to postpone appointment" });
  }
});

app.delete("/dashboard/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM appointments WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

// Book management endpoints
app.put("/dashboard/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price, pickup_station } = req.body;
    
    if (!title || !author || !price) {
      return res.status(400).json({ error: "Title, author, and price are required" });
    }
    
    const price_cents = Math.round(price * 100); // Convert to cents
    const result = await pool.query(
      "UPDATE books SET title = $1, author = $2, price_cents = $3, pickup_station = $4 WHERE id = $5 RETURNING *",
      [title, author, price_cents, pickup_station || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

app.delete("/dashboard/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM books WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Activity management endpoints
app.put("/dashboard/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, activity_date, activity_time, location } = req.body;
    const result = await pool.query(
      "UPDATE activities SET title = $1, description = $2, activity_date = $3, activity_time = $4, location = $5, updated_at = NOW() WHERE id = $6 RETURNING *",
      [title, description, activity_date, activity_time, location, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating activity:", err);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

app.delete("/dashboard/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM activities WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

// Absence management endpoints
app.get("/dashboard/absence", async (req, res) => {
  try {
    // First try to create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS absence_days (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    
    const result = await pool.query("SELECT * FROM absence_days ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching absence days:", err);
    res.status(500).json({ error: "Failed to fetch absence days" });
  }
});

app.post("/dashboard/absence", async (req, res) => {
  try {
    // First ensure the table exists with correct schema
    // Drop and recreate to ensure correct schema
    await pool.query(`DROP TABLE IF EXISTS absence_days`);
    await pool.query(`
      CREATE TABLE absence_days (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    
    const { date, reason } = req.body;
    
    // Ensure we have required fields
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    
    console.log('Creating absence day with data:', {
      date,
      reason: reason || ''
    });
    
    // Check if the table was created successfully
    const checkTable = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'absence_days' 
      ORDER BY ordinal_position
    `);
    
    console.log('Absence_days table columns:', checkTable.rows.map(r => r.column_name));
    
    const result = await pool.query(
      "INSERT INTO absence_days (date, reason, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [date, reason || '']
    );
    
    console.log('Absence day created successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating absence day:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ error: "Failed to create absence day", details: err.message });
  }
});

app.delete("/dashboard/absence/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM absence_days WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Absence day not found" });
    }
    res.json({ success: true, message: "Absence day deleted successfully" });
  } catch (err) {
    console.error("Error deleting absence day:", err);
    res.status(500).json({ error: "Failed to delete absence day" });
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