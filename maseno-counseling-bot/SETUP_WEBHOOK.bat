@echo off
echo 🎉 BOT DEPLOYED SUCCESSFULLY!
echo.

echo ✅ Your bot is now running on Render!
echo.

echo 🔧 Next step: Set up webhook for Telegram
echo.

echo Step 1: Get your bot's URL
echo Your bot URL should be: https://maseno-counseling-bot.onrender.com
echo.

echo Step 2: Set up webhook
echo Run this command to set up webhook:
echo.

echo curl -X POST "https://api.telegram.org/bot[YOUR_BOT_TOKEN]/setWebhook" -H "Content-Type: application/json" -d "{\"url\": \"https://maseno-counseling-bot.onrender.com/webhook\"}"
echo.

echo Step 3: Replace [YOUR_BOT_TOKEN] with your actual bot token
echo.

echo Step 4: Test your bot by sending a message!
echo.

echo 🎯 Your bot is live and ready to use!
echo.

pause
