@echo off
setlocal
cd /d "%~dp0"
echo Starting deploy...
git init
git branch -M main
git add .
git commit -m "initial"
gh repo create empire-blog-travel --public --push --source=. 2>nul || echo Repository already exists.
gh secret set GEMINI_API_KEY --prompt
gh secret set RESEND_API_KEY --body "re_9z4CxxuP_CidMRZLLteCYD7J3MpaWN18V"
git push -f -u origin main
echo Done!
pause
