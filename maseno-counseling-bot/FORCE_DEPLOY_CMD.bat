@echo off
echo 🚀 FORCING DEPLOY USING COMMAND LINE
echo.

echo 📋 Installing Render CLI and forcing deploy...
echo.

echo Step 1: Install Render CLI
npm install -g @render/cli

echo.
echo Step 2: Login to Render (you'll need to enter your credentials)
render auth login

echo.
echo Step 3: Force deploy your service
render service deploy srv-d36rbtripnbc738hkfv0

echo.
echo ✅ This will force a deployment using the latest commit!
echo.

pause
