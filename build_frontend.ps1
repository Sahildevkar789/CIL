$nodeDir = "$env:LOCALAPPDATA\Programs\nodejs"
$env:Path = "$nodeDir;$env:Path"
Set-Location -Path "$PSScriptRoot\frontend"
& "$nodeDir\npm.cmd" run build

