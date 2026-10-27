# Launcher script for Vite React Frontend Development Server
$nodeDir = "$env:LOCALAPPDATA\Programs\nodejs"
$env:Path = "$nodeDir;$env:Path"

Set-Location -Path "$PSScriptRoot\frontend"
Write-Output "Starting Vite Development Server on http://localhost:3000..."
& "$nodeDir\npm.cmd" run dev -- --host

