@echo off
title Webpenter · Autonomous Realtor Suite
color 0B
echo ======================================================================
echo    WEBPENTER - AUTONOMOUS REAL ESTATE OUTREACH SUITE (LOCALHOST)
echo ======================================================================
echo.
echo  Starting local control station on port 4000...
echo  Your browser will open automatically in 2 seconds.
echo.

cd /d "%~dp0"

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Launch browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:4000"

:: Start the server
node scripts/scout-server.js

pause
