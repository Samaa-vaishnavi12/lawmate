@echo off
title Law Mate Launcher
color 0A

echo =========================================
echo         LAW MATE - Starting App
echo =========================================
echo.

:: Start MongoDB service
echo [1/3] Starting MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo       MongoDB started successfully!
) else (
    echo       MongoDB already running or started.
)
timeout /t 2 /nobreak >nul

:: Start Backend Server
echo.
echo [2/3] Starting Backend Server (port 5000)...
cd /d "%~dp0server"
start "Law Mate Backend" cmd /k "npm start"
timeout /t 5 /nobreak >nul

:: Start Frontend
echo.
echo [3/3] Starting Frontend (port 3000)...
cd /d "%~dp0client"
start "Law Mate Frontend" cmd /k "npm run dev"
timeout /t 4 /nobreak >nul

:: Open in browser
echo.
echo Opening app in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo =========================================
echo  App is running!
echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:5000
echo  Close the two terminal windows to stop.
echo =========================================
pause
