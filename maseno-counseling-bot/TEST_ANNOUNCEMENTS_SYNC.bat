@echo off
echo 🔄 TESTING ANNOUNCEMENTS SYNC
echo.

echo ✅ What I just fixed:
echo 1. Added POST /dashboard/announcements route
echo 2. Added POST /dashboard/announcements/force route
echo 3. Added POST routes for activities and books
echo.

echo 🧪 Testing in 30 seconds...
timeout /t 30 /nobreak > nul

echo.
echo Testing POST /dashboard/announcements:
powershell -Command "try { $body = @{ message = 'Test announcement from dashboard'; is_force = $false } | ConvertTo-Json; $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/dashboard/announcements' -Method POST -Body $body -ContentType 'application/json'; Write-Host 'SUCCESS - Status:' $response.StatusCode; Write-Host 'Created:' $response.Content } catch { Write-Host 'ERROR:' $_.Exception.Message }"

echo.
echo Testing GET /dashboard/announcements (should show the new announcement):
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/dashboard/announcements' -Method GET; Write-Host 'SUCCESS - Status:' $response.StatusCode; Write-Host 'Data:' $response.Content } catch { Write-Host 'ERROR:' $_.Exception.Message }"

echo.
echo 🎯 Now test your dashboard:
echo 1. Go to your Netlify dashboard
echo 2. Add an announcement
echo 3. Check your bot - it should show the announcement!
echo.

echo ✅ Announcements should now sync between dashboard and bot!
echo.

pause
