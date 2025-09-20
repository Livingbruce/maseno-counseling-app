@echo off
echo 🚀 NETLIFY FORCE DEPLOY - COMPLETE GUIDE
echo.

echo ✅ What I just did:
echo 1. Created a new commit to trigger Netlify auto-deploy
echo 2. Pushed changes to GitHub
echo 3. Netlify should now be deploying the latest code
echo.

echo 📋 Step-by-Step Instructions:
echo.

echo Step 1: Check Netlify Deployment Status
echo - Go to: https://app.netlify.com/projects/maseno-counseling-bot/overview
echo - Click on "Deploys" tab
echo - Look for a new deployment (should be in progress or completed)
echo - Wait for it to show "Published" status
echo.

echo Step 2: If deployment failed, try manual deploy:
echo - In Netlify dashboard, click "Trigger deploy"
echo - Select "Deploy site"
echo - Wait for completion
echo.

echo Step 3: Clear Cache and Redeploy (if needed):
echo - Go to "Site settings" → "Build & deploy"
echo - Click "Clear cache and deploy site"
echo - Wait for completion
echo.

echo Step 4: Test the Updated Dashboard
echo - Open your dashboard: https://g-bot.netlify.app
echo - Press F12 to open browser console
echo - Go to Console tab
echo - Refresh the page
echo - Look for debug messages like:
echo   🚀 Making API call to: https://maseno-counseling-bot-production.up.railway.app/dashboard/announcements
echo   📡 API Response status: 200
echo   ✅ API Response data: [real data from Railway]
echo.

echo Step 5: Test Data Sync
echo - Create a new announcement in dashboard
echo - Check if it appears in your bot
echo - Check console for POST request logs
echo.

echo 🎯 Expected Results:
echo - Console shows API calls to Railway (not mock data)
echo - Data comes from Railway database
echo - New announcements sync to bot
echo.

echo ⚠️ If still not working:
echo 1. Check Netlify build logs for errors
echo 2. Clear browser cache completely (Ctrl+Shift+Delete)
echo 3. Try incognito/private browsing mode
echo 4. Check if build settings are correct
echo.

echo ✅ The latest code with Railway API connection should now be deployed!
echo.

pause
