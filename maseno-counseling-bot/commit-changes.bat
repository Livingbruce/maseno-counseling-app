@echo off
cd maseno-counseling-bot-v2
git add dashboard/package.json
git commit -m "Fix: Move Vite to dependencies for Vercel deployment"
git push origin main
echo Changes committed and pushed!
pause
