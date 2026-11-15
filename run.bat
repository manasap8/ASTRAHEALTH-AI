@echo off
echo ========================================================
echo  Starting Astronaut Health Monitoring System Backend...
echo ========================================================
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
    echo Error: Virtual environment .venv not found!
    pause
    exit /b 1
)
.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
pause
