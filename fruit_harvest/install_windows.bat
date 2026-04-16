@echo off
echo ============================================
echo Fruit Harvest - Rehabilitation Game Setup
echo ============================================
echo.

echo Step 1: Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    echo Make sure Python is installed and in your PATH
    pause
    exit /b 1
)

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo Step 3: Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo To test your webcam, run:
echo   python hand_tracker.py
echo.
echo To start the game, run:
echo   python main.py
echo.
echo Press any key to test webcam now...
pause >nul

python hand_tracker.py
