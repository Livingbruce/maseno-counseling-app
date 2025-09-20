@echo off
echo 🚨 RENDER IS USING OLD COMMIT!
echo.

echo ❌ Problem:
echo Render is using commit 5aa7422 (OLD)
echo Latest commit is: bccd46f (NEW with index.js)
echo.

echo 🔧 Solution: Force Render to use latest commit
echo.

echo Step 1: Check current commits
git log --oneline -3

echo.
echo Step 2: Make another small change to force detection
echo "Render force update $(Get-Date)" >> README.md

echo.
echo Step 3: Commit and push
git add README.md
git commit -m "FORCE RENDER UPDATE - $(Get-Date)"
git push

echo.
echo Step 4: Check if pushed
git log --oneline -2

echo.
echo ✅ This should force Render to detect the new commit!
echo.

pause
