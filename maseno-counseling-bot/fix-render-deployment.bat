@echo off
echo 🔧 Fixing Render Deployment Issue
echo.

echo ❌ Problem: Render can't find the backend folder
echo ✅ Solution: Move backend files to root directory
echo.

echo 📋 Fixing your project structure...

REM Create a new structure that Render can understand
if not exist "render-deploy" mkdir render-deploy

REM Copy backend files to root
xcopy "backend\*" "render-deploy\" /E /I /Y

REM Copy package.json to root
copy "backend\package.json" "render-deploy\package.json"

REM Create a simple start script
echo @echo off > render-deploy\start.bat
echo node src\index.js >> render-deploy\start.bat

echo ✅ Fixed! Your project is now ready for Render.
echo.

echo 📋 Next steps:
echo 1. Go to Render dashboard
echo 2. Delete the current service
echo 3. Create new service
echo 4. Connect to your GitHub repo
echo 5. Set Root Directory to: render-deploy
echo 6. Deploy!
echo.

pause
