@echo off
echo 🚨 URGENT: You MUST Change Start Command in Render!
echo.

echo ❌ Problem: Still running 'node src/index.js' (WRONG!)
echo ✅ Solution: Change to 'node index.js' (CORRECT!)
echo.

echo 📋 Do this RIGHT NOW:
echo.
echo 1. Go to: https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys/dep-d36rbubipnbc738hkgl0
echo 2. Click on your service name
echo 3. Click on "Settings" tab
echo 4. Scroll down to find "Start Command" section
echo 5. You will see: node src/index.js
echo 6. CHANGE IT TO: node index.js
echo 7. Click "Save Changes"
echo 8. Go to "Deployments" tab
echo 9. Click "Manual Deploy"
echo.

echo 🎯 CURRENT START COMMAND: node src/index.js (WRONG!)
echo 🎯 NEW START COMMAND: node index.js (CORRECT!)
echo.

echo ✅ The index.js file is already in GitHub root directory
echo ❌ But Render is still using the old start command
echo.

echo 🔥 THIS IS THE FINAL FIX - JUST CHANGE THE START COMMAND!
echo.

pause
