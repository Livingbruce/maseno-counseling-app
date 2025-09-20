@echo off
echo 🚀 DEPLOYING TO RAILWAY
echo.

echo Step 1: Install Railway CLI
npm install -g @railway/cli

echo.
echo Step 2: Login to Railway
railway login

echo.
echo Step 3: Create new project
railway init

echo.
echo Step 4: Deploy to Railway
railway up

echo.
echo Step 5: Get your Railway URL
railway domain

echo.
echo ✅ Railway deployment complete!
echo.

echo 📋 Your bot will be available at:
echo https://[your-project-name].railway.app
echo.

pause
