#!/usr/bin/env node

/**
 * Telegram Bot Deployment Helper
 * This script helps you deploy your Telegram bot to various platforms
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🤖 Maseno Counseling Bot - Deployment Helper\n');

// Check if we're in the right directory
if (!fs.existsSync('backend/package.json')) {
  console.error('❌ Error: Please run this script from the project root directory');
  console.log('   Make sure you have a backend/ folder with package.json');
  process.exit(1);
}

console.log('✅ Found backend folder with package.json');

// Check for required files
const requiredFiles = [
  'backend/src/bot.js',
  'backend/src/index.js',
  'backend/package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found ${file}`);
  } else {
    console.log(`❌ Missing ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing. Please check your backend folder.');
  process.exit(1);
}

console.log('\n🚀 Ready for deployment!');
console.log('\n📋 Next steps:');
console.log('1. Push your code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Deploy bot"');
console.log('   git push origin main');
console.log('\n2. Choose a hosting platform:');
console.log('   🌟 Railway (Recommended): https://railway.app');
console.log('   🔧 Render: https://render.com');
console.log('   🟣 Heroku: https://heroku.com');
console.log('\n3. Follow the deployment guide in TELEGRAM_BOT_DEPLOYMENT.md');
console.log('\n4. Don\'t forget to:');
console.log('   - Set your BOT_TOKEN');
console.log('   - Set your DATABASE_URL');
console.log('   - Set your webhook URL');
console.log('\n🎯 Your bot will be live and ready to help students!');

// Check if .env file exists
if (fs.existsSync('backend/.env')) {
  console.log('\n✅ Found .env file in backend folder');
  console.log('   Make sure to copy these variables to your hosting platform');
} else {
  console.log('\n⚠️  No .env file found in backend folder');
  console.log('   You\'ll need to set environment variables in your hosting platform');
}

console.log('\n📖 For detailed instructions, see: TELEGRAM_BOT_DEPLOYMENT.md');
