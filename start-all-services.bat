@echo off
echo =====================================
echo RVISED - Starting App
echo =====================================
echo.

REM Start Next.js Development Server (Port 3000)
echo [1/2] Starting Next.js Development Server...
start "Next.js App" cmd /k "cd rvised && npm run dev"
timeout /t 3 >nul

REM Open browser
echo [2/2] Opening browser...
start http://localhost:3000

echo.
echo =====================================
echo App started successfully!
echo =====================================
echo.
echo Service running:
echo - Next.js App: http://localhost:3000
echo.
echo Test transcript extraction:
echo curl -X POST http://localhost:3000/api/transcript -H "Content-Type: application/json" -d "{^"videoUrl^":^"https://www.youtube.com/watch?v=VIDEO_ID^"}"
echo.
echo Press any key to stop the app...
pause >nul

REM Kill all services
echo.
echo Stopping app...
taskkill /FI "WindowTitle eq Next.js App*" /T /F >nul 2>&1
echo App stopped.
pause