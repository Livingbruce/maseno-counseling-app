@echo off
echo 🚨 RENDER DEPLOYMENT ISSUE
echo.

echo ❌ Problem:
echo Render is using OLD commit: 5aa7422
echo Latest commit is: bccd46f (has index.js in root)
echo.

echo 🔧 SOLUTION: Manual Deploy in Render Dashboard
echo.

echo Step 1: Go to Render Dashboard
echo https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys
echo.

echo Step 2: Click "Manual Deploy" button
echo.

echo Step 3: Select "Deploy latest commit"
echo.

echo Step 4: Click "Deploy"
echo.

echo ✅ This will force Render to use commit bccd46f with index.js
echo.

echo 📋 Alternative: Check if auto-deploy is enabled
echo Go to Settings > Build & Deploy
echo Make sure "Auto-Deploy" is ON
echo.

pause
