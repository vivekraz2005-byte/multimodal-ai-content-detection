@echo off
title AuthenticityAI One-Click Launcher
echo ========================================================
echo   Starting AuthenticityAI - Multimodal Forensic Platform
echo ========================================================
echo.

set PROJECT_DIR=C:\Users\DELL\Desktop\Multimodal-AI-Detection

:: 1. Check if backend is already running on port 8000
netstat -ano | findstr /C:":8000 " | findstr /C:"LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...
    start "AuthenticityAI Backend" /min cmd /c "cd /d %PROJECT_DIR%\backend && .\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [1/3] Backend is already active on port 8000.
)

:: 2. Check if frontend is already running on port 5173
netstat -ano | findstr /C:":5173 " | findstr /C:"LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/3] Launching React Frontend on http://localhost:5173 ...
    start "AuthenticityAI Frontend" /min cmd /c "cd /d %PROJECT_DIR%\frontend && npm.cmd run dev"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [2/3] Frontend is already active on port 5173.
)

:: 3. Open browser at working link
echo [3/3] Opening your browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo   AuthenticityAI is online at: http://localhost:5173
echo ========================================================
ping 127.0.0.1 -n 2 >nul
exit
