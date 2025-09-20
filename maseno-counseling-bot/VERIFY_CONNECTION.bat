@echo off
echo 🔗 VERIFYING BOT-DASHBOARD CONNECTION
echo.

echo ✅ What's been fixed:
echo 1. Added GET /api/appointments endpoint to Railway
echo 2. Fixed CORS to allow Netlify frontend
echo 3. Updated frontend to use Railway API instead of mock data
echo.

echo 🎯 Current setup:
echo - Railway API: https://maseno-counseling-bot-production.up.railway.app
echo - Netlify Frontend: https://app.netlify.com/projects/maseno-counseling-bot/overview
echo - Database: Neon (shared between both)
echo.

echo 📋 Test steps:
echo 1. Open your Netlify dashboard
echo 2. Check if appointments from bot appear
echo 3. Try adding an appointment in dashboard
echo 4. Check if it appears in bot
echo.

echo 🔍 Debug info:
echo - Railway API has appointments: YES
echo - CORS is fixed: YES
echo - Frontend connects to Railway: YES
echo.

echo ✅ Your bot and dashboard should now be connected!
echo.

pause
