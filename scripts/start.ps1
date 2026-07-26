#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$RunDir = Join-Path $Root '.run'
$LogsDir = Join-Path $Root 'logs'
$BackendPidFile = Join-Path $RunDir 'backend.pid'
$FrontendPidFile = Join-Path $RunDir 'frontend.pid'

function Test-PortListening([int]$Port) {
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-ForPort([int]$Port, [int]$TimeoutSec, [string]$Label) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening $Port) { return $true }
        Start-Sleep -Seconds 2
        Write-Host "  ... waiting for $Label (port $Port)"
    }
    return $false
}

function Save-Pid([string]$Path, [int]$ProcessId) {
    New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
    Set-Content -Path $Path -Value $ProcessId -Encoding ascii
}

function Show-LogTail([string]$LogPath, [int]$Lines = 25) {
    if (-not (Test-Path $LogPath)) {
        Write-Host "  (log not found: $LogPath)" -ForegroundColor DarkYellow
        return
    }
    Write-Host ''
    Write-Host "--- last lines of $(Split-Path -Leaf $LogPath) ---" -ForegroundColor DarkYellow
    Get-Content $LogPath -Tail $Lines -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
    Write-Host '----------------------------------------' -ForegroundColor DarkYellow
}

function Ensure-Postgres {
    if (Test-PortListening 5432) {
        Write-Host '[0/3] PostgreSQL already running.' -ForegroundColor Green
        return
    }

    Write-Host '[0/3] PostgreSQL is not running. Starting service...'
    $svc = Get-Service -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like 'postgresql*' } |
        Select-Object -First 1

    if (-not $svc) {
        Write-Host 'ERROR: PostgreSQL service not found.' -ForegroundColor Red
        Write-Host 'Install PostgreSQL or start it manually, then create DB: personalfinance' -ForegroundColor Yellow
        exit 1
    }

    try {
        if ($svc.Status -ne 'Running') {
            Start-Service -Name $svc.Name -ErrorAction Stop
            Write-Host "  Started service: $($svc.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "ERROR: Could not start $($svc.Name). Try as Administrator:" -ForegroundColor Red
        Write-Host "  Start-Service $($svc.Name)" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor DarkYellow
        exit 1
    }

    if (-not (Wait-ForPort 5432 45 'PostgreSQL')) {
        Write-Host 'ERROR: PostgreSQL did not open port 5432.' -ForegroundColor Red
        exit 1
    }
    Write-Host '  PostgreSQL ready on port 5432' -ForegroundColor Green
}

Write-Host ''
Write-Host '========================================'
Write-Host '  PersonalFinance - START'
Write-Host '========================================'
Write-Host ''

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

Ensure-Postgres

$backendUp = Test-PortListening 8080
$frontendUp = Test-PortListening 3000

if ($backendUp -and $frontendUp) {
    Write-Host 'Already running.' -ForegroundColor Yellow
    Write-Host '  Note: if you changed backend code, run stop.bat then start.bat again.' -ForegroundColor DarkYellow
    Start-Process 'http://localhost:3000'
    Write-Host 'Browser opened: http://localhost:3000' -ForegroundColor Green
    exit 0
}

if (-not $backendUp) {
    Write-Host '[1/3] Starting backend (Spring Boot)...'
    $backendLog = Join-Path $LogsDir 'backend.log'
    if (Test-Path $backendLog) { Remove-Item $backendLog -Force -ErrorAction SilentlyContinue }

    $backendProc = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList "/c mvn spring-boot:run -Dmaven.test.skip=true > `"$backendLog`" 2>&1" `
        -WorkingDirectory (Join-Path $Root 'backend') `
        -PassThru -WindowStyle Minimized
    Save-Pid $BackendPidFile $backendProc.Id

    $deadline = (Get-Date).AddSeconds(180)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening 8080) {
            $ready = $true
            break
        }
        # Fail fast if Maven/Java already exited
        $alive = Get-Process -Id $backendProc.Id -ErrorAction SilentlyContinue
        if (-not $alive) {
            Write-Host 'ERROR: Backend process exited early.' -ForegroundColor Red
            Show-LogTail $backendLog 40
            Write-Host 'Full log: logs\backend.log' -ForegroundColor Yellow
            exit 1
        }
        Start-Sleep -Seconds 2
        Write-Host '  ... waiting for backend (port 8080)'
    }

    if (-not $ready) {
        Write-Host 'ERROR: Backend did not start within 180s.' -ForegroundColor Red
        Show-LogTail $backendLog 40
        Write-Host 'Full log: logs\backend.log' -ForegroundColor Yellow
        exit 1
    }
    Write-Host '  Backend ready on port 8080' -ForegroundColor Green
} else {
    Write-Host '[1/3] Backend already running.'
}

if (-not $frontendUp) {
    Write-Host '[2/3] Starting frontend (Next.js)...'
    $frontendDir = Join-Path $Root 'frontend'
    if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
        Write-Host '  Running npm install (first time)...'
        Push-Location $frontendDir
        npm install --silent
        Pop-Location
    }
    $frontendLog = Join-Path $LogsDir 'frontend.log'
    if (Test-Path $frontendLog) { Remove-Item $frontendLog -Force -ErrorAction SilentlyContinue }

    $frontendProc = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList "/c npm run dev > `"$frontendLog`" 2>&1" `
        -WorkingDirectory $frontendDir `
        -PassThru -WindowStyle Minimized
    Save-Pid $FrontendPidFile $frontendProc.Id

    if (-not (Wait-ForPort 3000 90 'frontend')) {
        Write-Host 'ERROR: Frontend did not start. See logs\frontend.log' -ForegroundColor Red
        Show-LogTail $frontendLog 30
        exit 1
    }
    Write-Host '  Frontend ready on port 3000' -ForegroundColor Green
} else {
    Write-Host '[2/3] Frontend already running.'
}

Write-Host '[3/3] Opening browser...'
Start-Process 'http://localhost:3000'

Write-Host ''
Write-Host 'PersonalFinance is running.' -ForegroundColor Green
Write-Host '  UI:    http://localhost:3000'
Write-Host '  API:   http://localhost:8080/api/v1/'
Write-Host '  Login: admin / admin'
Write-Host ''
Write-Host 'To stop: double-click stop.bat'
Write-Host ''
