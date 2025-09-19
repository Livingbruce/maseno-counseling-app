@echo off
echo 🚀 Quick Fix for Render Deployment
echo.

echo ❌ Problem: Render can't find the backend folder
echo ✅ Solution: Fix the root directory setting
echo.

echo 📋 Do this now:
echo.
echo 1. Go to: https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys/dep-d36rbubipnbc738hkgl0
echo 2. Click on your service
echo 3. Go to Settings tab
echo 4. Find Root Directory section
echo 5. Change from: backend
echo 6. Change to: render-deploy
echo 7. Click Save
echo 8. Go to Deployments tab
echo 9. Click Manual Deploy
echo.

echo 🎯 Alternative if that doesn't work:
echo 1. Change Root Directory to: . (just a dot)
echo 2. Change Start Command to: cd backend && npm start
echo 3. Save and redeploy
echo.

echo 🔧 I'll help you with any issues!
echo.

pause
