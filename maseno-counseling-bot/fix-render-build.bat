@echo off
echo 🔧 Fixing Render Build Command
echo.

echo ❌ Problem: Render is trying to build frontend instead of backend
echo ✅ Solution: Change build command to run backend only
echo.

echo 📋 Do this now:
echo.
echo 1. Go to: https://dashboard.render.com/web/srv-d36rbtripnbc738hkfv0/deploys/dep-d36rbubipnbc738hkgl0
echo 2. Click on your service
echo 3. Go to Settings tab
echo 4. Find Build Command section
echo 5. Change from: npm install && cd frontend && npm install --include=dev && npx vite build
echo 6. Change to: cd backend && npm install
echo 7. Click Save
echo.
echo 8. Find Start Command section
echo 9. Change to: cd backend && npm start
echo 10. Click Save
echo.
echo 11. Find Root Directory section
echo 12. Change to: . (just a dot)
echo 13. Click Save
echo.
echo 14. Go to Deployments tab
echo 15. Click Manual Deploy
echo.

echo 🎯 This will fix the build issue!
echo.

pause
