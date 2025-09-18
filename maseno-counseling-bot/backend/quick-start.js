#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🚀 Maseno Counseling Bot - Quick Start');
console.log('======================================\n');

console.log('🤖 Your bot: msu_counseling_bot');
console.log('📱 Students will find it by searching this username on Telegram\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  console.log('📋 Current configuration:');
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        if (key === 'BOT_TOKEN') {
          console.log(`   ${key}: ${value.substring(0, 10)}...${value.substring(value.length - 4)}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      }
    });
  } catch (error) {
    console.log('   ⚠️  Could not read .env file');
  }
} else {
  console.log('❌ .env file not found');
  console.log('📝 Create backend/.env file with:');
  console.log('   DATABASE_URL=your-database-connection-string');
  console.log('   JWT_SECRET=maseno-counseling-super-secret-jwt-key-2024');
  console.log('   BOT_TOKEN=your-msu-counseling-bot-token-here');
  console.log('   PORT=4000');
  console.log('   NODE_ENV=development');
  console.log('   DEBUG_DB=false');
}

console.log('\n🎯 Next steps:');
console.log('1. Get your bot token from @BotFather');
console.log('2. Create backend/.env file with your token');
console.log('3. Run: npm run dev');
console.log('4. Test your bot on Telegram!');

console.log('\n📱 Students will use your bot by:');
console.log('   • Searching "msu_counseling_bot" on Telegram');
console.log('   • Sending /start to begin');
console.log('   • Using the keyboard buttons to navigate');

console.log('\n🔧 You manage it via:');
console.log('   • Web Dashboard: https://maseno-counseling-bot.vercel.app/');
console.log('   • Login: vicymbrush@gmail.com / Victor254');

console.log('\n🚀 Ready to start your bot?');
