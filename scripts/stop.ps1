#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
function Stop-Tree([int]$ProcessId) {
    $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" -ErrorAction SilentlyContinue)
    Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    foreach ($child in $children) { Stop-Tree $child.ProcessId }
}
foreach ($name in @('frontend','backend')) {
    $file = Join-Path $Root ".run\$name.pid"
    if (-not (Test-Path -LiteralPath $file)) { continue }
    $idText = (Get-Content -LiteralPath $file -Raw).Trim()
    if ($idText -notmatch '^\d+$') { continue }
    $proc = Get-Process -Id ([int]$idText) -ErrorAction SilentlyContinue
    $owned = $false
    if ($proc -and (Test-Path -LiteralPath "$file.json")) {
        $record = Get-Content -LiteralPath "$file.json" -Raw | ConvertFrom-Json
        $owned = $record.root -eq $Root -and $proc.StartTime.ToUniversalTime().Ticks -eq [long]$record.startTicks
    } elseif ($proc) {
        # Compatibility with the previous launcher; do not trust a recycled PID alone.
        $info = Get-CimInstance Win32_Process -Filter "ProcessId=$idText"
        $owned = $info.CommandLine -and $info.CommandLine.Contains($Root)
    }
    if ($owned) { Stop-Tree $proc.Id; Write-Host "Stopped PersonalFinance $name." }
    elseif ($proc) { Write-Warning "Skipped ${name}: process ownership could not be verified."; continue }
    Remove-Item -LiteralPath $file -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath "$file.json") { Remove-Item -LiteralPath "$file.json" }
}
