@echo off
echo 🚨 RENDER IS USING OLD COMMIT - FORCE UPDATE!
echo.

echo ❌ Problem: Render using old commit without index.js in root
echo ✅ Solution: Force Render to use latest commit
echo.

echo 📋 Do this RIGHT NOW:
echo.
echo 1. Go to: https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys/dep-d36rbubipnbc738hkgl0
echo 2. Click on your service name
echo 3. Go to "Deployments" tab
echo 4. Click "Manual Deploy"
echo 5. Make sure it says "Deploy latest commit"
echo 6. Click "Deploy"
echo.

echo 🎯 Current commit: 4a70878 (HAS index.js in root)
echo 🎯 Render using: 5aa7422 (OLD - no index.js in root)
echo.

echo ✅ This will force Render to use the latest commit with index.js
echo.

pause
