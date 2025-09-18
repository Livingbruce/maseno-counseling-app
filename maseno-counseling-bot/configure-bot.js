#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Configuring msu_counseling_bot');
console.log('==================================\n');

console.log('📋 Your bot: msu_counseling_bot');
console.log('📱 Students will find it by searching this username on Telegram\n');

console.log('🔧 Configuration Steps:\n');

console.log('1️⃣  Get your bot token:');
console.log('   • Open Telegram → Search @BotFather');
console.log('   • Send: /mybots');
console.log('   • Select: msu_counseling_bot');
console.log('   • Click: "API Token"');
console.log('   • Copy the token\n');

console.log('2️⃣  Create backend/.env file:');
console.log('   DATABASE_URL=your-database-connection-string');
console.log('   JWT_SECRET=maseno-counseling-super-secret-jwt-key-2024');
console.log('   BOT_TOKEN=your-msu-counseling-bot-token-here');
console.log('   PORT=4000');
console.log('   NODE_ENV=development');
console.log('   DEBUG_DB=false\n');

console.log('3️⃣  Install dependencies:');
console.log('   cd backend && npm install\n');

console.log('4️⃣  Start the bot:');
console.log('   cd backend && npm run dev\n');

console.log('🎯 What your bot will do:');
console.log('   • Welcome students with /start command');
console.log('   • Show interactive keyboard with all features');
console.log('   • Handle appointment booking automatically');
console.log('   • Manage support tickets');
console.log('   • Send announcements to students');
console.log('   • Connect to your web dashboard\n');

console.log('📱 Students will use it by:');
console.log('   • Searching "msu_counseling_bot" on Telegram');
console.log('   • Sending /start to begin');
console.log('   • Using the keyboard buttons to navigate\n');

console.log('🔧 You manage it via:');
console.log('   • Web Dashboard: https://maseno-counseling-bot.vercel.app/');
console.log('   • Login: vicymbrush@gmail.com / Victor254\n');

console.log('🚀 Ready to configure your bot?');
console.log('   Follow the steps above and your bot will be live!');
