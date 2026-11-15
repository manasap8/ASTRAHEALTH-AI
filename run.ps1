Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting Astronaut Health Monitoring System Backend..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Error "Virtual environment '.venv' not found!"
    exit 1
}

& ".\.venv\Scripts\python.exe" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
