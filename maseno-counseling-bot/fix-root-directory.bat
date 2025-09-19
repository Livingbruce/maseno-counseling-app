@echo off
echo 🔧 Fixing Root Directory - Final Fix!
echo.

echo ❌ Problem: Render is looking for double src folder
echo ✅ Solution: Change root directory to . (just a dot)
echo.

echo 📋 Do this now:
echo.
echo 1. Go to: https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys/dep-d36rbubipnbc738hkgl0
echo 2. Click on your service
echo 3. Go to Settings tab
echo 4. Find Root Directory section
echo 5. Change from: src
echo 6. Change to: . (just a dot)
echo 7. Click Save
echo 8. Make sure Start Command is: node src/index.js
echo 9. Go to Deployments tab
echo 10. Click Manual Deploy
echo.

echo 🎯 This will fix the root directory issue!
echo.

pause
