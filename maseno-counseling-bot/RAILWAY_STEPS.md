# 🚀 Railway Setup - Exact Steps

## 📋 What You Need to Do Right Now:

### Step 1: Get Your Bot Token
1. **Open Telegram**
2. **Search for**: @BotFather
3. **Send**: `/token` (if you have existing bot)
4. **OR send**: `/newbot` (if creating new bot)
5. **Copy the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Go to Railway
1. **Open**: https://railway.app
2. **Click "Login"** (top right)
3. **Select "Login with GitHub"**
4. **Authorize Railway**

### Step 3: Find Your Project
1. **Look for**: `maseno-counseling-bot` in your projects
2. **Click on it** to open the project dashboard

### Step 4: Fix Root Directory
1. **Click on your service** (the deployed app)
2. **Go to "Settings" tab**
3. **Find "Root Directory" section**
4. **Change from empty to**: `backend`
5. **Click "Save"**

### Step 5: Set Environment Variables
1. **Go to "Variables" tab**
2. **Add these variables one by one**:

```
BOT_TOKEN=your_bot_token_here
DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=maseno-counseling-bot-secret-key-2024
NODE_ENV=production
PORT=3001
```

### Step 6: Wait for Deployment
1. **Go to "Deployments" tab**
2. **Wait for**: "Deployed successfully"
3. **Copy the URL** (e.g., https://your-app.railway.app)

### Step 7: Set Webhook
1. **Open Command Prompt** (Windows + R, type `cmd`)
2. **Navigate to your project**:
   ```bash
   cd "C:\Users\Fluxtech Solutions\Desktop\web development\maseno-counseling-bot"
   ```
3. **Run**:
   ```bash
   node setup-webhook.js
   ```

## 🎯 That's It!

Your bot will be live and ready to help students!

## 🔧 Need Help?

**Tell me what you see at each step and I'll help you fix any issues!**
