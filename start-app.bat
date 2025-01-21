@echo off
echo Starting Coding Tasks Manager...

start cmd /k "cd /d %~dp0 && npm start"
timeout /t 5
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo Application started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
