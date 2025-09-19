@echo off
echo 🚨 URGENT: Fix Root Directory - It's Still Wrong!
echo.

echo ❌ Problem: Still looking for double src folder
echo ✅ Solution: Root directory MUST be . (just a dot)
echo.

echo 📋 Do this RIGHT NOW:
echo.
echo 1. Go to: https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys/dep-d36rbubipnbc738hkgl0
echo 2. Click on your service
echo 3. Go to Settings tab
echo 4. Find Root Directory section
echo 5. Look at what it currently says - it probably says 'src'
echo 6. Change it to: . (just a dot)
echo 7. Click Save
echo 8. Go to Deployments tab
echo 9. Click Manual Deploy
echo.

echo 🎯 The Root Directory MUST be . (dot) NOT src!
echo.

echo ✅ I verified: src/index.js exists in your project
echo ❌ Render is looking in wrong place because root directory is wrong
echo.

pause
