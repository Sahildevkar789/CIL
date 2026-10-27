# Launcher script for SMARTFLOW AI Flask Backend
$pythonDir = "$env:LOCALAPPDATA\Programs\python311"
$env:Path = "$pythonDir;$pythonDir\Scripts;$env:Path"
$env:PYTHONPATH = "$PSScriptRoot\backend"

Write-Output "Starting SMARTFLOW AI API Server on http://127.0.0.1:5000..."
& "$pythonDir\python.exe" backend\app.py

