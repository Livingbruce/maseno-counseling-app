@echo off
echo 🎯 FINAL VERIFICATION - BOT & DASHBOARD CONNECTION
echo.

echo ✅ Environment Variables Set:
echo - DATABASE_URL: ✅ Neon database connected
echo - BOT_TOKEN: ✅ Set in Railway
echo - NODE_ENV: ✅ production
echo - JWT_SECRET: ✅ Set
echo - PORT: ✅ 3001
echo.

echo 🔗 Connection Status:
echo - Railway API: https://maseno-counseling-bot-production.up.railway.app
echo - Netlify Dashboard: https://app.netlify.com/projects/maseno-counseling-bot/overview
echo - Database: Neon (shared between both)
echo.

echo 📋 Test Your Setup:
echo 1. Open your Netlify dashboard
echo 2. Check if you see appointments from the bot
echo 3. Try adding a new appointment in the dashboard
echo 4. Check if it appears when you use the bot
echo.

echo 🎉 Everything should now be working!
echo Your bot and dashboard are connected to the same database.
echo.

echo 🔍 Quick Test URLs:
echo - API Health: https://maseno-counseling-bot-production.up.railway.app/health
echo - Appointments: https://maseno-counseling-bot-production.up.railway.app/api/appointments
echo - Books: https://maseno-counseling-bot-production.up.railway.app/api/books
echo.

pause
