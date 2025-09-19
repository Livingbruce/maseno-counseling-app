@echo off
echo 🤖 Maseno Counseling Bot - Deployment Helper
echo.

echo ✅ Checking your project...
if not exist "backend\package.json" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Make sure you have a backend\ folder with package.json
    pause
    exit /b 1
)

echo ✅ Found backend folder with package.json
echo.

echo 🚀 Ready for deployment!
echo.

echo 📋 Next steps:
echo 1. Push your code to GitHub:
echo    git add .
echo    git commit -m "Deploy bot"
echo    git push origin main
echo.

echo 2. Open Railway:
echo    https://railway.app
echo.

echo 3. Run setup-railway-cmd.bat for detailed instructions
echo.

echo 4. After deployment, run setup-webhook-cmd.bat
echo.

echo 🎯 Your bot will be live and ready to help students!
echo.

pause
