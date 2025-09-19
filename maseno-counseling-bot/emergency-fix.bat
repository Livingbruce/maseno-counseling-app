@echo off
echo 🚨 Emergency Fix for Railway Deployment
echo.

echo ❌ Problem: Railway is still looking for root directory and failing
echo ✅ Solution: Delete and recreate the service
echo.

echo 📋 Step-by-Step Fix:
echo.
echo 1. Go to Railway dashboard
echo 2. Click on your project: maseno-counseling-bot
echo 3. Click on your service
echo 4. Go to Settings tab
echo 5. Scroll down to "Danger Zone"
echo 6. Click "Delete Service"
echo 7. Confirm deletion
echo.
echo 8. Create New Service:
echo    - Click "New Service"
echo    - Select "Deploy from GitHub repo"
echo    - Choose: maseno-counseling-bot
echo    - Set Root Directory: backend
echo    - Click "Deploy"
echo.
echo 9. Add Environment Variables:
echo    BOT_TOKEN=8423141480:AAGaUCF3EI9Y2lYooVwp-w8kNQyEudl7pHQ
echo    DATABASE_URL=postgresql://neondb_owner:npg_mxctpnL51sTU@ep-withered-shape-abox0wby-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
echo    JWT_SECRET=maseno-counseling-bot-secret-key-2024
echo    NODE_ENV=production
echo    PORT=3001
echo.
echo 10. Wait for deployment
echo 11. Run setup-webhook-cmd.bat
echo.

echo 🎯 Alternative: Use Render instead (see RENDER_DEPLOYMENT_GUIDE.md)
echo.

pause
