$nb = Get-Content -Raw -Encoding UTF8 "Smart_Traffic_Management_Task4_(1).ipynb" | ConvertFrom-Json
$cellsToCheck = @(60, 61, 62, 63, 64, 65)
foreach ($idx in $cellsToCheck) {
    $c = $nb.cells[$idx]
    Write-Output "=================================================="
    Write-Output "CELL $idx OUTPUTS"
    Write-Output "=================================================="
    foreach ($out in $c.outputs) {
        if ($out.text) {
            Write-Output ($out.text -join "")
        } elseif ($out.data -and $out.data."text/plain") {
            Write-Output ($out.data."text/plain" -join "")
        }
    }
}

