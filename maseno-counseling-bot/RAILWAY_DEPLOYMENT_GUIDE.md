# 🚀 Deploy Your Maseno Counseling Bot to Railway

## 🎯 Why Railway?

- ✅ **Free tier** - Perfect for starting out
- ✅ **Easy deployment** - Connect GitHub and deploy
- ✅ **Automatic HTTPS** - Secure connections
- ✅ **Database support** - Built-in PostgreSQL
- ✅ **Environment variables** - Easy configuration
- ✅ **24/7 uptime** - Your bot never sleeps

## 📋 Prerequisites

1. **GitHub account** with your code pushed
2. **Railway account** (free at railway.app)
3. **Telegram bot token** from @BotFather
4. **Database connection string** (or use Railway's database)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Ensure your code is on GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Create a Railway-specific package.json in backend folder:**
   ```json
   {
     "name": "maseno-counseling-bot",
     "version": "1.0.0",
     "type": "module",
     "main": "src/index.js",
     "scripts": {
       "start": "node src/index.js",
       "dev": "node src/index.js"
     },
     "dependencies": {
       "telegraf": "^4.15.0",
       "pg": "^8.11.3",
       "bcrypt": "^5.1.1",
       "jsonwebtoken": "^9.0.2",
       "node-cron": "^3.0.3",
       "node-fetch": "^3.3.2",
       "dotenv": "^16.3.1",
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "helmet": "^7.1.0",
       "express-rate-limit": "^7.1.5",
       "express-slow-down": "^2.0.1",
       "express-mongo-sanitize": "^2.2.0",
       "express-validator": "^7.0.1"
     }
   }
   ```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Select the `backend` folder** as the root directory

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=maseno-counseling-super-secret-jwt-key-2024
BOT_TOKEN=your-telegram-bot-token-from-botfather
PORT=4000
NODE_ENV=production
DEBUG_DB=false
```

### Step 4: Set Up Database

**Option A: Use Railway's Database**
1. **Add PostgreSQL** service in Railway
2. **Copy the DATABASE_URL** from the database service
3. **Paste it** in your environment variables

**Option B: Use Your Existing Database**
1. **Use your current database connection string**
2. **Add it** to environment variables

### Step 5: Deploy and Test

1. **Railway will automatically deploy** your bot
2. **Check the logs** to ensure it's running
3. **Test your bot** on Telegram
4. **Your bot is now live 24/7!** 🎉

## 🔧 Alternative: Quick Local Setup

If you want to test locally first:

```bash
# 1. Create backend/.env file
cd backend
echo "DATABASE_URL=your-database-connection-string" > .env
echo "JWT_SECRET=maseno-counseling-super-secret-jwt-key-2024" >> .env
echo "BOT_TOKEN=your-telegram-bot-token" >> .env
echo "PORT=4000" >> .env
echo "NODE_ENV=development" >> .env
echo "DEBUG_DB=false" >> .env

# 2. Install dependencies
npm install

# 3. Start the bot
npm run dev
```

## 🎯 What Happens After Deployment?

- ✅ **Your bot runs 24/7** on Railway's servers
- ✅ **Students can find it** on Telegram
- ✅ **You manage it** via the web dashboard
- ✅ **All features work** automatically
- ✅ **Database is connected** and working

## 🆘 Troubleshooting

**Bot not responding?**
- Check Railway logs for errors
- Verify BOT_TOKEN is correct
- Ensure database connection works

**Database errors?**
- Check DATABASE_URL format
- Ensure database is accessible
- Run database migrations if needed

## 🎉 You're Ready!

Once deployed, your Maseno Counseling Bot will be live and helping students 24/7! 🚀

**Next steps:**
1. Deploy to Railway
2. Test with students
3. Share the bot username
4. Manage via dashboard
