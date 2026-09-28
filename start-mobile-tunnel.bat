@echo off
title Webpenter · Mobile Remote Tunnel (Access from Anywhere)
color 0A
echo ======================================================================
echo    WEBPENTER - MOBILE REMOTE TUNNEL FOR AUTONOMOUS SUITE
echo ======================================================================
echo.
echo  Creating secure public URL for port 4000...
echo  You can open this URL on your smartphone from anywhere (cellular or Wi-Fi).
echo.

cd /d "%~dp0"

npx --yes localtunnel --port 4000

pause
