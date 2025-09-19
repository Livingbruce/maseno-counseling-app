@echo off
echo 🔗 Setting up Telegram bot webhook...
echo.

set /p RAILWAY_URL="Enter your Railway URL (e.g., https://your-app.railway.app): "

if "%RAILWAY_URL%"=="" (
    echo ❌ Please enter a valid URL
    pause
    exit /b 1
)

echo.
echo 🔄 Setting up webhook...

curl -X POST "https://api.telegram.org/bot8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ/setWebhook" ^
     -H "Content-Type: application/json" ^
     -d "{\"url\": \"%RAILWAY_URL%/webhook\"}"

echo.
echo 🔍 Checking webhook status...

curl "https://api.telegram.org/bot8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ/getWebhookInfo"

echo.
echo 🎯 Next steps:
echo 1. Go to Telegram
echo 2. Search for your bot
echo 3. Send /start
echo 4. Test your bot!
echo.

pause
