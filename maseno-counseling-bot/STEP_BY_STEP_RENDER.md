# 🚀 Step-by-Step: Deploy Your Bot (Super Easy!)

## 📋 Follow These Exact Steps:

### Step 1: Go to Render
1. **Click**: https://render.com
2. **Click**: "Get Started for Free"
3. **Click**: "Sign up with GitHub"
4. **Click**: "Authorize Render"

### Step 2: Create Web Service
1. **Click**: "New +" (top right)
2. **Click**: "Web Service"
3. **Click**: "Connect GitHub"
4. **Find**: `maseno-counseling-bot`
5. **Click**: "Connect"

### Step 3: Configure Service
**Fill in these exact values:**

- **Name**: `maseno-counseling-bot`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: `Node`

### Step 4: Add Environment Variables
**Click "Add Environment Variable" for each:**

1. **Name**: `BOT_TOKEN`
   **Value**: `8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ`

2. **Name**: `DATABASE_URL`
   **Value**: `postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

3. **Name**: `JWT_SECRET`
   **Value**: `maseno-counseling-bot-secret-key-2024`

4. **Name**: `NODE_ENV`
   **Value**: `production`

5. **Name**: `PORT`
   **Value**: `3001`

### Step 5: Deploy
1. **Click**: "Create Web Service"
2. **Wait**: 2-3 minutes for deployment
3. **Copy**: The URL (e.g., https://your-app.onrender.com)

### Step 6: Set Up Webhook
1. **Open Command Prompt** (Windows + R, type `cmd`)
2. **Type**: `cd "C:\Users\Fluxtech Solutions\Desktop\web development\maseno-counseling-bot"`
3. **Type**: `simple-webhook-setup.bat`
4. **Enter**: Your Render URL when asked

### Step 7: Test Your Bot
1. **Go to Telegram**
2. **Search for your bot**
3. **Send**: `/start`
4. **Your bot should respond!**

## 🎯 That's It!

Much easier than Railway! I'll help you with any step.

## 🔧 Need Help?

**Tell me which step you're on and I'll help you!**
