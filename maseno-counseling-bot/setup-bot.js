#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Maseno Counseling Bot Setup');
console.log('================================\n');

console.log('📋 To set up your Telegram bot, follow these steps:\n');

console.log('1️⃣  Create a Telegram Bot:');
console.log('   • Open Telegram and search for @BotFather');
console.log('   • Send: /newbot');
console.log('   • Choose a name: "Maseno Counseling Bot"');
console.log('   • Choose a username: "maseno_counseling_bot"');
console.log('   • Copy the token you receive\n');

console.log('2️⃣  Get your Database URL:');
console.log('   • Use your existing database connection string');
console.log('   • Format: postgresql://username:password@host:port/database\n');

console.log('3️⃣  Create backend/.env file with:');
console.log('   DATABASE_URL=your-database-connection-string');
console.log('   JWT_SECRET=maseno-counseling-super-secret-jwt-key-2024');
console.log('   BOT_TOKEN=your-telegram-bot-token-from-botfather');
console.log('   PORT=4000');
console.log('   NODE_ENV=development');
console.log('   DEBUG_DB=false\n');

console.log('4️⃣  Install dependencies:');
console.log('   cd backend && npm install\n');

console.log('5️⃣  Start the bot:');
console.log('   cd backend && npm run dev\n');

console.log('🎯 Your bot will then be running and ready to receive messages!');
console.log('📱 Students can find your bot by searching for its username on Telegram.\n');

console.log('💡 Need help? Check the README.md for detailed instructions.');
