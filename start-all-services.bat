@echo off
echo =====================================
echo RVISED - Starting All Services
echo =====================================
echo.

REM Start Python Backend (Port 5000)
echo [1/4] Starting Python Backend Service...
start "Python Backend" cmd /k "cd python-backend && python backend.py"
timeout /t 2 >nul

REM Start Playwright Service (Port 8787)
echo [2/4] Starting Playwright Transcript Service...
start "Playwright Service" cmd /k "cd transcript-service && npm start"
timeout /t 2 >nul

REM Start Next.js Development Server (Port 3000)
echo [3/4] Starting Next.js Development Server...
start "Next.js App" cmd /k "cd rvised && npm run dev"
timeout /t 3 >nul

REM Open browser
echo [4/4] Opening browser...
start http://localhost:3000

echo.
echo =====================================
echo All services started successfully!
echo =====================================
echo.
echo Services running:
echo - Python Backend: http://localhost:5000
echo - Playwright Service: http://localhost:8787
echo - Next.js App: http://localhost:3000
echo.
echo Test transcript extraction:
echo http://localhost:3000/api/transcript?videoUrl=YOUTUBE_URL
echo.
echo Press any key to stop all services...
pause >nul

REM Kill all services
echo.
echo Stopping all services...
taskkill /FI "WindowTitle eq Python Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Playwright Service*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Next.js App*" /T /F >nul 2>&1
echo All services stopped.
pause