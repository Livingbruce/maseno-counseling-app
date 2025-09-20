@echo off
echo 🔍 TESTING API CONNECTION
echo.

echo Step 1: Test Railway API directly
echo Testing: https://maseno-counseling-bot-production.up.railway.app/api/appointments
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/api/appointments' -Method GET; Write-Host 'SUCCESS: API is working'; Write-Host 'Response:'; $response.Content } catch { Write-Host 'ERROR: API call failed'; Write-Host $_.Exception.Message }"

echo.
echo Step 2: Test CORS with browser simulation
echo Testing CORS headers...

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://maseno-counseling-bot-production.up.railway.app/api/appointments' -Method GET -Headers @{'Origin'='https://maseno-counseling-bot.netlify.app'}; Write-Host 'CORS Headers:'; $response.Headers | Where-Object {$_.Key -like '*Access-Control*'} } catch { Write-Host 'CORS test failed' }"

echo.
echo Step 3: Check if frontend is using mock data
echo The frontend should now connect to Railway API instead of mock data
echo.

pause
