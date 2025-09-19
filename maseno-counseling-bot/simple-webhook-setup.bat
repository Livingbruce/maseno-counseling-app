@echo off
echo 🤖 Simple Webhook Setup - I'll Help You!
echo.

echo Step 1: Deploy your bot on Render.com
echo Step 2: Get your Render URL (e.g., https://your-app.onrender.com)
echo Step 3: Run this script
echo.

set /p RENDER_URL="Enter your Render URL (e.g., https://your-app.onrender.com): "

if "%RENDER_URL%"=="" (
    echo ❌ Please enter a valid URL
    pause
    exit /b 1
)

echo.
echo 🔄 Setting up webhook for your bot...

curl -X POST "https://api.telegram.org/bot8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ/setWebhook" ^
     -H "Content-Type: application/json" ^
     -d "{\"url\": \"%RENDER_URL%/webhook\"}"

echo.
echo ✅ Webhook set up! Your bot should be working now.
echo.

echo 🎯 Test your bot:
echo 1. Go to Telegram
echo 2. Search for your bot
echo 3. Send /start
echo 4. Your bot should respond!
echo.

pause
