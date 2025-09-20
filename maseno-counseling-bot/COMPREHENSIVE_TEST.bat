@echo off
echo 🔍 COMPREHENSIVE BOT-DASHBOARD CONNECTION TEST
echo.

echo ✅ Issues Found and Fixed:
echo 1. Bot was using localhost URLs instead of Railway
echo 2. Frontend was calling /dashboard/* routes that didn't exist
echo 3. Added public routes for frontend access
echo.

echo 🧪 Testing API Endpoints:
echo.

echo Testing /api/appointments:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/api/appointments' -Method GET; Write-Host 'Status:' $response.StatusCode; Write-Host 'Content:' $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo Testing /dashboard/appointments:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/dashboard/appointments' -Method GET; Write-Host 'Status:' $response.StatusCode; Write-Host 'Content:' $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo Testing /api/announcements:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/api/announcements' -Method GET; Write-Host 'Status:' $response.StatusCode; Write-Host 'Content:' $response.Content } catch { Write-Host 'Error:' $_.Exception.Message }"

echo.
echo 🎯 Next Steps:
echo 1. Wait for Railway to deploy the fixes
echo 2. Test the bot - announcements should work now
echo 3. Test the Netlify dashboard - should connect to Railway API
echo 4. Add some sample data to test synchronization
echo.

pause
