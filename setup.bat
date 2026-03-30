@echo off
REM Music Chatbot Setup Script for Windows

echo.
echo ====================================
echo Music Recommendation Chatbot Setup
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/4] Python found. Creating virtual environment...
cd backend
python -m venv venv

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies...
pip install -r requirements.txt

echo [4/4] Setup complete!
echo.
echo ====================================
echo Next Steps:
echo ====================================
echo.
echo 1. Keep this terminal open and run:
echo    python app.py
echo.
echo 2. Open another terminal in the frontend folder and run:
echo    python -m http.server 8000
echo.
echo 3. Open http://localhost:8000 in your browser
echo.
echo ====================================
echo.
pause
