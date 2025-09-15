// Standalone bot file for Railway deployment
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./backend/src/db/pool.js";
import fetch from "node-fetch";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Import all bot functionality from the main bot file
// This is a simplified version - you'll need to copy the full bot.js content here
// or import it properly

// User session management
const userSessions = new Map();
const bookingSessions = new Map();
const supportSessions = new Map();

// Add all your bot functions here...
// (Copy the entire content from backend/src/bot.js)

// Start the bot
bot.launch()
  .then(() => {
    console.log("✅ Telegram bot started successfully on Railway");
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram bot:", err);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
