# 🚀 Quick Start: Deploy Your Telegram Bot

## ⚡ 5-Minute Deployment to Railway

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Deploy bot"
git push origin main
```

### Step 2: Deploy to Railway
1. **Go to**: [railway.app](https://railway.app)
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repo**: `maseno-counseling-bot`
6. **Set Root Directory**: `backend`
7. **Click "Deploy"**

### Step 3: Set Environment Variables
In Railway dashboard → Variables tab:

```env
BOT_TOKEN=your_bot_token_from_botfather
DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
PORT=3001
```

### Step 4: Set Webhook
After deployment, copy your Railway URL and run:

```bash
node setup-webhook.js
```

**Or manually:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.railway.app/webhook"}'
```

### Step 5: Test Your Bot
1. **Find your bot** on Telegram
2. **Send `/start`**
3. **Test commands**: `/book`, `/support`, `/help`

## 🎯 That's It!

Your bot is now live and ready to help students! 🎉

## 🔧 Need Help?

- **Full Guide**: See `TELEGRAM_BOT_DEPLOYMENT.md`
- **Webhook Issues**: Run `node setup-webhook.js`
- **Check Logs**: Railway dashboard → Logs tab

## 📱 Bot Features

Your bot includes:
- ✅ **Appointment booking**
- ✅ **Support chat**
- ✅ **Announcements**
- ✅ **Activity notifications**
- ✅ **Database integration**
- ✅ **Admin controls**

**Ready to deploy? Let's go! 🚀**
