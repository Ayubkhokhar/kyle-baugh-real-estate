@echo off
title Webpenter · Autonomous Realtor Suite
color 0B

cd /d "%~dp0"

echo ======================================================================
echo    WEBPENTER - AUTONOMOUS REAL ESTATE OUTREACH SUITE (LOCALHOST)
echo ======================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Automatically free port 4000 if an old or frozen session is holding it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING 2^>nul') do (
    echo [Notice] Freeing port 4000 from previous background session [PID %%a]...
    taskkill /F /PID %%a >nul 2>&1
)

:: Safe 1-second pause to let Windows socket release
ping 127.0.0.1 -n 2 >nul

echo  Starting local control station on port 4000...
echo  Local PC:   http://localhost:4000
echo.
echo  Tip: If you click inside this window and it pauses, press ENTER to resume.
echo.

:: 3. Launch default browser after 2 seconds
start "" cmd /c "ping 127.0.0.1 -n 3 >nul & start http://localhost:4000"

:: 4. Start the server
node scripts/scout-server.js

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Server stopped with exit code %errorlevel%.
)

pause
