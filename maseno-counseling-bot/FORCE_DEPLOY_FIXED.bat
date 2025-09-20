@echo off
echo 🚀 FORCING DEPLOY USING COMMAND LINE (FIXED)
echo.

echo 📋 Method 1: Install correct Render CLI
echo.
echo Step 1: Install Render CLI (correct package name)
npm install -g render-cli

echo.
echo Step 2: Login to Render
render auth login

echo.
echo Step 3: Force deploy
render service deploy srv-d36rbtripnbc738hkfv0

echo.
echo 📋 Method 2: Alternative - Use Git to force push
echo.
echo Step 1: Make a small change to force new commit
echo. >> README.md
echo "Force deploy $(Get-Date)" >> README.md

echo.
echo Step 2: Commit and push
git add README.md
git commit -m "Force deploy - $(Get-Date)"
git push

echo.
echo ✅ This will trigger a new deployment automatically!
echo.

pause
