# SMARTFLOW AI Master Launcher
# Starts both Backend and Frontend in separate PowerShell background windows
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SMARTFLOW AI — Smart Traffic Management System Launch" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$pythonDir = "$env:LOCALAPPDATA\Programs\python311"
$nodeDir = "$env:LOCALAPPDATA\Programs\nodejs"

# 1. Start Backend in separate window
Write-Host "Starting Flask API Backend on http://127.0.0.1:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot\run_backend.ps1"

# 2. Wait 3 seconds for backend initialization
Start-Sleep -Seconds 3

# 3. Start Frontend in separate window
Write-Host "Starting Vite React Dashboard on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot\run_frontend.ps1"

Write-Host ""
Write-Host "Application is active!" -ForegroundColor Cyan
Write-Host "• Frontend Dashboard: http://localhost:3000" -ForegroundColor Yellow
Write-Host "• Production GUI:     http://127.0.0.1:5000" -ForegroundColor Yellow
Write-Host "• API Health:         http://127.0.0.1:5000/api/health" -ForegroundColor Yellow
Write-Host "• Model Status:       http://127.0.0.1:5000/api/models/status" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

