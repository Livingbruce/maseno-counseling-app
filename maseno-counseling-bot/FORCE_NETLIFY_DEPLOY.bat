@echo off
echo 🚀 FORCE DEPLOYING NETLIFY
echo.

echo Method 1: Manual Deploy in Netlify Dashboard
echo 1. Go to: https://app.netlify.com/projects/maseno-counseling-bot/overview
echo 2. Click on "Deploys" tab
echo 3. Click "Trigger deploy" button
echo 4. Select "Deploy site"
echo 5. Wait for deployment to complete
echo.

echo Method 2: Clear Cache and Redeploy
echo 1. Go to: https://app.netlify.com/projects/maseno-counseling-bot/overview
echo 2. Go to "Site settings" → "Build & deploy"
echo 3. Click "Clear cache and deploy site"
echo 4. Wait for deployment to complete
echo.

echo Method 3: Check Build Settings
echo 1. Go to: https://app.netlify.com/projects/maseno-counseling-bot/overview
echo 2. Go to "Site settings" → "Build & deploy" → "Build settings"
echo 3. Make sure:
echo    - Build command: cd frontend && npm install && npm run build
echo    - Publish directory: frontend/dist
echo    - Base directory: (leave empty)
echo.

echo Method 4: Force via Git (if connected)
echo 1. Make a small change to force new commit
echo 2. Commit and push to trigger auto-deploy
echo.

echo 🎯 After deployment:
echo 1. Wait 2-3 minutes for deployment to complete
echo 2. Clear your browser cache (Ctrl+F5)
echo 3. Open browser console (F12)
echo 4. Check for debug messages
echo.

echo ✅ This should force Netlify to use the latest code with Railway API connection!
echo.

pause
