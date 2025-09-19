#!/usr/bin/env node

/**
 * Telegram Bot Webhook Setup
 * This script helps you set up the webhook for your deployed bot
 */

import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 Telegram Bot Webhook Setup\n');

async function setupWebhook() {
  try {
    // Get bot token
    const botToken = await new Promise((resolve) => {
      rl.question('Enter your bot token (from @BotFather): ', resolve);
    });

    if (!botToken || botToken.length < 10) {
      console.error('❌ Invalid bot token');
      process.exit(1);
    }

    // Get webhook URL
    const webhookUrl = await new Promise((resolve) => {
      rl.question('Enter your webhook URL (from Railway/Render/Heroku): ', resolve);
    });

    if (!webhookUrl || !webhookUrl.startsWith('https://')) {
      console.error('❌ Invalid webhook URL. Must start with https://');
      process.exit(1);
    }

    console.log('\n🔄 Setting up webhook...');

    // Set webhook
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl
      })
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`   URL: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to set webhook:', result.description);
    }

    // Check webhook info
    console.log('\n🔍 Checking webhook status...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const info = await infoResponse.json();

    if (info.ok) {
      console.log('📊 Webhook Info:');
      console.log(`   URL: ${info.result.url}`);
      console.log(`   Pending Updates: ${info.result.pending_update_count}`);
      console.log(`   Last Error: ${info.result.last_error_message || 'None'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Test webhook
async function testWebhook() {
  try {
    const botToken = await new Promise((resolve) => {
      rl.question('Enter your bot token to test: ', resolve);
    });

    console.log('\n🧪 Testing webhook...');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook is working!');
      console.log(`   URL: ${result.result.url}`);
      console.log(`   Pending Updates: ${result.result.pending_update_count}`);
    } else {
      console.error('❌ Webhook test failed:', result.description);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Main menu
console.log('Choose an option:');
console.log('1. Set up webhook');
console.log('2. Test webhook');
console.log('3. Delete webhook');

rl.question('Enter your choice (1-3): ', async (choice) => {
  switch (choice) {
    case '1':
      await setupWebhook();
      break;
    case '2':
      await testWebhook();
      break;
    case '3':
      const botToken = await new Promise((resolve) => {
        rl.question('Enter your bot token: ', resolve);
      });
      
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
          method: 'POST'
        });
        const result = await response.json();
        
        if (result.ok) {
          console.log('✅ Webhook deleted successfully!');
        } else {
          console.error('❌ Failed to delete webhook:', result.description);
        }
      } catch (error) {
        console.error('❌ Error:', error.message);
      } finally {
        rl.close();
      }
      break;
    default:
      console.log('Invalid choice');
      rl.close();
  }
});
