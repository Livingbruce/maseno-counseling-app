# 🤖 Telegram Bot Deployment Guide

## 🚀 Deploy to Railway (Recommended)

### Step 1: Prepare Your Repository
1. **Push your code to GitHub** (if not already done)
2. **Ensure your bot code is in the `backend/` folder**
3. **Make sure you have a `package.json` in the backend folder**

### Step 2: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. **Sign up with GitHub** (recommended)
3. **Connect your GitHub account**

### Step 3: Deploy Your Bot
1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository**: `maseno-counseling-bot`
4. **Select the backend folder** as the root directory
5. **Railway will automatically detect Node.js**

### Step 4: Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here
BOT_USERNAME=your_bot_username
WEBHOOK_URL=https://your-railway-app.railway.app

# API Configuration
API_BASE_URL=https://your-railway-app.railway.app
JWT_SECRET=your_jwt_secret_here

# Admin Configuration
ADMIN_TELEGRAM_ID=your_telegram_user_id
ADMIN_EMAIL=admin@maseno.ac.ke
ADMIN_PASSWORD=your_admin_password

# Security
NODE_ENV=production
PORT=3001
```

### Step 5: Get Your Telegram Bot Token
1. **Message @BotFather** on Telegram
2. **Send `/newbot`** (if creating new bot)
3. **Send `/token`** (if you have existing bot)
4. **Copy the token** and add to Railway variables

### Step 6: Deploy
1. **Click "Deploy"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Copy the generated URL** (e.g., `https://your-app.railway.app`)

### Step 7: Set Webhook (Important!)
After deployment, you need to set the webhook:

```bash
# Replace with your actual bot token and Railway URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.railway.app/webhook"}'
```

## 🔧 Alternative: Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. **Sign up with GitHub**

### Step 2: Deploy
1. **Click "New +"**
2. **Select "Web Service"**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

### Step 3: Add Environment Variables
Same as Railway, add all the environment variables in Render dashboard.

## 🔧 Alternative: Deploy to Heroku

### Step 1: Install Heroku CLI
```bash
# Windows
winget install Heroku.HerokuCLI

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login and Create App
```bash
heroku login
heroku create maseno-counseling-bot
```

### Step 3: Set Environment Variables
```bash
heroku config:set BOT_TOKEN=your_bot_token
heroku config:set DATABASE_URL=your_database_url
heroku config:set JWT_SECRET=your_jwt_secret
# ... add all other variables
```

### Step 4: Deploy
```bash
cd backend
git add .
git commit -m "Deploy bot"
git push heroku main
```

## 📱 Test Your Bot

### Step 1: Find Your Bot
1. **Search for your bot** on Telegram using the username
2. **Start a conversation** with `/start`

### Step 2: Test Commands
- `/start` - Start the bot
- `/book` - Book an appointment
- `/support` - Get support
- `/help` - See all commands

### Step 3: Check Logs
- **Railway**: Go to your project → Logs tab
- **Render**: Go to your service → Logs tab
- **Heroku**: `heroku logs --tail`

## 🛠️ Troubleshooting

### Common Issues:
1. **Bot not responding**: Check webhook URL
2. **Database errors**: Verify DATABASE_URL
3. **Environment variables**: Make sure all are set
4. **Port issues**: Railway/Render handle this automatically

### Debug Commands:
```bash
# Check webhook status
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

# Delete webhook (if needed)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

## 🎯 Recommended: Railway

**Why Railway?**
- ✅ **Free tier** with $5 credit monthly
- ✅ **Easy deployment** from GitHub
- ✅ **Built-in database** (PostgreSQL)
- ✅ **Environment variables** easy to manage
- ✅ **Auto-deploy** on code changes
- ✅ **Great for beginners**

## 🚀 Quick Start Commands

```bash
# 1. Push to GitHub (if not done)
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Go to railway.app
# 3. Connect GitHub repo
# 4. Deploy backend folder
# 5. Add environment variables
# 6. Set webhook URL
```

Your bot will be live and ready to help students! 🎉
