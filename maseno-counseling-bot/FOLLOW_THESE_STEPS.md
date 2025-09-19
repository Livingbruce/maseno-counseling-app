# 🚀 Follow These Steps - Command Prompt Ready!

## 📋 Step 1: Open Railway
1. **Click this link**: https://railway.app
2. **Click "Login"** (top right)
3. **Click "Login with GitHub"**
4. **Click "Authorize Railway"**

## 📋 Step 2: Find Your Project
1. **Look for**: `maseno-counseling-bot` in your projects
2. **Click on it**

## 📋 Step 3: Fix Root Directory
1. **Click on your service** (the deployed app)
2. **Click "Settings" tab**
3. **Find "Root Directory"**
4. **Change from empty to**: `backend`
5. **Click "Save"**

## 📋 Step 4: Add Environment Variables
1. **Click "Variables" tab**
2. **Click "New Variable"** for each one:

**Variable 1:**
- **Name**: `BOT_TOKEN`
- **Value**: `8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ`

**Variable 2:**
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

**Variable 3:**
- **Name**: `JWT_SECRET`
- **Value**: `maseno-counseling-bot-secret-key-2024`

**Variable 4:**
- **Name**: `NODE_ENV`
- **Value**: `production`

**Variable 5:**
- **Name**: `PORT`
- **Value**: `3001`

## 📋 Step 5: Wait for Deployment
1. **Click "Deployments" tab**
2. **Wait for**: "Deployed successfully"
3. **Copy the URL** (looks like: https://your-app.railway.app)

## 📋 Step 6: Set Webhook (Command Prompt)
1. **Open Command Prompt** (Windows + R, type `cmd`)
2. **Navigate to your project**:
   ```cmd
   cd "C:\Users\Fluxtech Solutions\Desktop\web development\maseno-counseling-bot"
   ```
3. **Run**:
   ```cmd
   setup-webhook-cmd.bat
   ```

## 🎯 That's It!

Your bot will be live and ready to help students!

## 🔧 Need Help?

**Tell me what you see at each step and I'll help you!**
