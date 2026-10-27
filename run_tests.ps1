$env:PYTHONPATH = "$PSScriptRoot\backend"
& "$env:LOCALAPPDATA\Programs\python311\python.exe" -m pytest backend\tests -v

