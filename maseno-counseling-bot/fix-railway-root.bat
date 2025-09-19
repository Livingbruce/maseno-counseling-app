@echo off
echo 🔧 Fixing Railway Root Directory Issue
echo.

echo ❌ Problem: Railway is looking for /backend but can't find it
echo ✅ Solution: Root directory should be "backend" (without forward slash)
echo.

echo 📋 Steps to fix:
echo 1. Go to: https://railway.app
echo 2. Login with GitHub
echo 3. Find your project: maseno-counseling-bot
echo 4. Click on your service
echo 5. Go to Settings → Root Directory
echo 6. Change from: /backend
echo 7. Change to: backend (without the forward slash)
echo 8. Click Save
echo.

echo 🎯 That's it! Railway will automatically redeploy.
echo.

echo After fixing, run setup-webhook-cmd.bat to set up your bot.
echo.

pause
