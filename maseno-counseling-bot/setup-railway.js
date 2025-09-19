#!/usr/bin/env node

/**
 * Railway Setup Helper
 * This script helps you prepare everything for Railway deployment
 */

import fs from 'fs';
import readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Railway Setup Helper for Maseno Counseling Bot\n');

async function setupRailway() {
  try {
    console.log('📋 Let\'s set up your bot for Railway deployment!\n');

    // Check if we're in the right directory
    if (!fs.existsSync('backend/package.json')) {
      console.error('❌ Error: Please run this script from the project root directory');
      console.log('   Make sure you have a backend/ folder with package.json');
      process.exit(1);
    }

    console.log('✅ Found backend folder with package.json\n');

    // Get bot token
    console.log('🤖 Step 1: Get your Telegram Bot Token');
    console.log('   1. Open Telegram');
    console.log('   2. Search for @BotFather');
    console.log('   3. Send /token (if you have existing bot) or /newbot (if creating new)');
    console.log('   4. Copy the token\n');

    const botToken = await new Promise((resolve) => {
      rl.question('Enter your bot token: ', resolve);
    });

    if (!botToken || botToken.length < 10) {
      console.error('❌ Invalid bot token. Please get a valid token from @BotFather');
      process.exit(1);
    }

    // Generate JWT secret
    const jwtSecret = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

    console.log('\n✅ Generated JWT secret');

    // Create .env file
    const envContent = `# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret
JWT_SECRET=${jwtSecret}

# Telegram Bot
BOT_TOKEN=${botToken}

# Server Configuration
PORT=3001
NODE_ENV=production

# Security
DEBUG_DB=false
`;

    fs.writeFileSync('backend/.env', envContent);
    console.log('✅ Created backend/.env file');

    // Create Railway configuration
    const railwayConfig = {
      "$schema": "https://railway.app/railway.schema.json",
      "build": {
        "builder": "NIXPACKS"
      },
      "deploy": {
        "startCommand": "npm start",
        "healthcheckPath": "/health",
        "healthcheckTimeout": 100,
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
      }
    };

    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
    console.log('✅ Created railway.json configuration');

    console.log('\n🎯 Next Steps:');
    console.log('1. Go to https://railway.app');
    console.log('2. Login with GitHub');
    console.log('3. Find your maseno-counseling-bot project');
    console.log('4. Click on your service');
    console.log('5. Go to Settings → Root Directory');
    console.log('6. Set Root Directory to: backend');
    console.log('7. Go to Variables tab and add these:');
    console.log('');
    console.log('BOT_TOKEN=' + botToken);
    console.log('DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    console.log('JWT_SECRET=' + jwtSecret);
    console.log('NODE_ENV=production');
    console.log('PORT=3001');
    console.log('');
    console.log('8. Save and wait for deployment');
    console.log('9. Copy the deployment URL');
    console.log('10. Run: node setup-webhook.js');

    console.log('\n📖 For detailed instructions, see: RAILWAY_SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Check if user wants to continue
rl.question('Do you want to set up your bot for Railway? (y/n): ', async (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    await setupRailway();
  } else {
    console.log('Setup cancelled. Run this script again when ready!');
    rl.close();
  }
});
