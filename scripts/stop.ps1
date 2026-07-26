#Requires -Version 5.1
$ErrorActionPreference = 'SilentlyContinue'

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$RunDir = Join-Path $Root '.run'
$BackendPidFile = Join-Path $RunDir 'backend.pid'
$FrontendPidFile = Join-Path $RunDir 'frontend.pid'

function Stop-ProcessTree([int]$RootPid) {
    Get-CimInstance Win32_Process -Filter "ParentProcessId=$RootPid" -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-ProcessTree $_.ProcessId }
    Stop-Process -Id $RootPid -Force -ErrorAction SilentlyContinue
}

function Stop-ByPort([int]$Port, [string]$Label) {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) { return $false }
    $processIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $processIds) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "  Stopped $Label (port $Port, PID $p)" -ForegroundColor Green
    }
    return $true
}

Write-Host ''
Write-Host '========================================'
Write-Host '  PersonalFinance - STOP'
Write-Host '========================================'
Write-Host ''

$stopped = $false

foreach ($file in @($FrontendPidFile, $BackendPidFile)) {
    if (Test-Path $file) {
        $processId = Get-Content $file -ErrorAction SilentlyContinue
        if ($processId -match '^\d+$') {
            Stop-ProcessTree ([int]$processId)
            $stopped = $true
        }
        Remove-Item $file -Force -ErrorAction SilentlyContinue
    }
}

if (Stop-ByPort 3000 'frontend') { $stopped = $true }
if (Stop-ByPort 8080 'backend')  { $stopped = $true }

Write-Host ''
if ($stopped) {
    Write-Host 'PersonalFinance stopped.' -ForegroundColor Green
} else {
    Write-Host 'Nothing was running.' -ForegroundColor Yellow
}
Write-Host ''
