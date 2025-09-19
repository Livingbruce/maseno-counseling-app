# 🚀 Railway Setup - Step by Step Guide

## 📋 What You Need to Do:

### Step 1: Access Railway
1. **Go to**: https://railway.app
2. **Click "Login"** (top right)
3. **Select "Login with GitHub"**
4. **Authorize Railway** to access your GitHub

### Step 2: Find Your Project
1. **Look for**: `maseno-counseling-bot` in your projects
2. **Click on it** to open the project dashboard

### Step 3: Fix Root Directory
1. **Click on your service** (the deployed app)
2. **Go to "Settings" tab**
3. **Find "Root Directory" section**
4. **Change from empty to**: `backend`
5. **Click "Save"**

### Step 4: Set Environment Variables
1. **Go to "Variables" tab**
2. **Add these variables one by one**:

```env
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
PORT=3001
```

### Step 5: Get Your Bot Token
1. **Open Telegram**
2. **Search for**: @BotFather
3. **Send**: `/token`
4. **Copy the token** and paste it in Railway

### Step 6: Check Deployment
1. **Go to "Deployments" tab**
2. **Look for**: "Deployed successfully"
3. **Copy the URL** (e.g., https://your-app.railway.app)

### Step 7: Set Webhook
1. **Open Command Prompt** (Windows + R, type `cmd`)
2. **Navigate to your project folder**:
   ```bash
   cd "C:\Users\Fluxtech Solutions\Desktop\web development\maseno-counseling-bot"
   ```
3. **Run the webhook setup**:
   ```bash
   node setup-webhook.js
   ```

## 🎯 That's It!

Your bot will be live and ready to help students!

## 🔧 Need Help?

**Tell me what you see at each step and I'll help you fix any issues!**
