// Vercel API handler
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Maseno Counseling Bot API is running!",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!",
    data: {
      service: "Maseno Counseling Bot",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development"
    }
  });
});

// Catch-all for API routes
app.get("/api/*", (req, res) => {
  res.json({ 
    error: "API endpoint not found",
    availableEndpoints: [
      "/api/health",
      "/api/test"
    ],
    path: req.path
  });
});

// Export for Vercel
export default app;
