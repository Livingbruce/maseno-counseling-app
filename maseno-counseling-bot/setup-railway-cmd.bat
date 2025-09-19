@echo off
echo 🚀 Railway Setup via Command Prompt
echo.

echo 📋 Let's set up your bot for Railway deployment!
echo.

echo Step 1: Open Railway in your browser
echo 1. Go to: https://railway.app
echo 2. Login with GitHub
echo 3. Find your project: maseno-counseling-bot
echo 4. Click on your service
echo 5. Go to Settings → Root Directory
echo 6. Change to: backend
echo 7. Save
echo.

echo Step 2: Add Environment Variables
echo Go to Variables tab and add these:
echo.
echo BOT_TOKEN=8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ
echo DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
echo JWT_SECRET=maseno-counseling-bot-secret-key-2024
echo NODE_ENV=production
echo PORT=3001
echo.

echo Step 3: Wait for deployment
echo 1. Go to Deployments tab
echo 2. Wait for "Deployed successfully"
echo 3. Copy the URL (e.g., https://your-app.railway.app)
echo.

echo Step 4: Set webhook
echo After deployment, run: setup-webhook-cmd.bat
echo.

pause
