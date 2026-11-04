#Requires -Version 5.1
param([switch]$Dev, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$RunDir = Join-Path $Root '.run'
$LogsDir = Join-Path $Root 'logs'
$BackendPidFile = Join-Path $RunDir 'backend.pid'
$FrontendPidFile = Join-Path $RunDir 'frontend.pid'

$envFile = Join-Path $Root '.env'
if (Test-Path -LiteralPath $envFile) {
    foreach ($line in Get-Content -LiteralPath $envFile) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim('"').Trim("'"), 'Process')
        }
    }
}
if ($env:SERVER_PORT -and $env:SERVER_PORT -ne '8080') { throw 'Windows launcher requires SERVER_PORT=8080; use manual launch for other ports.' }

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
    $proc = Get-Process -Id $ProcessId
    @{ processId = $ProcessId; startTicks = $proc.StartTime.ToUniversalTime().Ticks; root = $Root } |
        ConvertTo-Json | Set-Content -LiteralPath "$Path.json" -Encoding UTF8
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

try { $launchLock = [IO.File]::Open((Join-Path $RunDir 'start.lock'), 'OpenOrCreate', 'ReadWrite', 'None') }
catch { Write-Host 'PersonalFinance is already starting.'; exit 0 }

Ensure-Postgres

function Resolve-MvnCmd {
    $localMvn = Join-Path $Root 'tools\maven\bin\mvn.cmd'
    if (Test-Path $localMvn) { return $localMvn }
    $fromPath = Get-Command mvn -ErrorAction SilentlyContinue
    if ($fromPath) { return $fromPath.Source }
    Write-Host 'ERROR: Maven not found.' -ForegroundColor Red
    Write-Host 'Place Apache Maven under tools\maven or add mvn to PATH.' -ForegroundColor Yellow
    exit 1
}

$backendUp = Test-PortListening 8080
$frontendUp = Test-PortListening 3000

foreach ($entry in @(@(8080, $BackendPidFile), @(3000, $FrontendPidFile))) {
    if (-not (Test-PortListening $entry[0])) { continue }
    if (-not (Test-Path -LiteralPath $entry[1])) { throw "Port $($entry[0]) is occupied by another app." }
    $savedId = [int](Get-Content -LiteralPath $entry[1] -Raw).Trim()
    $savedProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$savedId" -ErrorAction SilentlyContinue
    if (-not $savedProcess -or -not $savedProcess.CommandLine.Contains($Root)) {
        throw "Port $($entry[0]) is occupied; PersonalFinance process ownership could not be verified."
    }
}

if ($backendUp -and $frontendUp) {
    Write-Host 'Already running.' -ForegroundColor Yellow
    Write-Host '  Note: if you changed backend code, run stop.bat then start.bat again.' -ForegroundColor DarkYellow
    if (-not $NoBrowser) { Start-Process 'http://127.0.0.1:3000' }
    Write-Host 'Browser opened: http://127.0.0.1:3000' -ForegroundColor Green
    exit 0
}

if (-not $backendUp) {
    Write-Host '[1/3] Starting backend (Spring Boot)...'
    $backendLog = Join-Path $LogsDir 'backend.log'
    if (Test-Path $backendLog) { Remove-Item $backendLog -Force -ErrorAction SilentlyContinue }

    # Prefer local tools\maven; cmd quoting breaks on paths with spaces if mvn.cmd is absolute.
    $jar = Join-Path $Root 'backend\target\personal-finance-0.0.1-SNAPSHOT.jar'
    $latestBackend = Get-ChildItem -LiteralPath (Join-Path $Root 'backend\src'), (Join-Path $Root 'backend\pom.xml') -Recurse -File |
        Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if (-not (Test-Path $jar) -or $latestBackend.LastWriteTimeUtc -gt (Get-Item $jar).LastWriteTimeUtc) {
        $mvn = Resolve-MvnCmd
        Push-Location (Join-Path $Root 'backend')
        try {
            & $mvn package -DskipTests
            if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
        } finally { Pop-Location }
    }
    $backendProc = Start-Process -FilePath 'java.exe' `
        -ArgumentList @('-jar', "`"$jar`"", '--server.address=127.0.0.1') `
        -RedirectStandardOutput $backendLog -RedirectStandardError (Join-Path $LogsDir 'backend.error.log') `
        -WorkingDirectory (Join-Path $Root 'backend') `
        -PassThru -WindowStyle Hidden
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

    $frontendMode = if ($Dev) { 'dev' } else { 'start' }
    if (-not $Dev) {
        $buildId = Join-Path $frontendDir '.next\BUILD_ID'
        $sourcePaths = @('src','features','shared','lib','utils','public','package.json','package-lock.json','next.config.ts','tailwind.config.ts','tsconfig.json','postcss.config.js')
        $latestSource = $sourcePaths | ForEach-Object { Get-ChildItem -LiteralPath (Join-Path $frontendDir $_) -File -Recurse } | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
        if (-not (Test-Path $buildId) -or $latestSource.LastWriteTimeUtc -gt (Get-Item $buildId).LastWriteTimeUtc) {
            Push-Location $frontendDir
            try {
                npm.cmd run build
                if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed. Check output above.' }
            } finally { Pop-Location }
        }
    }
    $frontendProc = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList "/c npm run $frontendMode -- -H 127.0.0.1 > `"$frontendLog`" 2>&1" `
        -WorkingDirectory $frontendDir `
        -PassThru -WindowStyle Hidden
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
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/api/v1/health' -UseBasicParsing -TimeoutSec 15 | Out-Null
Invoke-WebRequest -Uri 'http://127.0.0.1:3000/login' -UseBasicParsing -TimeoutSec 15 | Out-Null
if (-not $NoBrowser) { Start-Process 'http://127.0.0.1:3000' }

Write-Host ''
Write-Host 'PersonalFinance is running.' -ForegroundColor Green
Write-Host '  UI:    http://127.0.0.1:3000'
Write-Host '  API:   http://127.0.0.1:8080/api/v1/'
Write-Host '  Login: admin / admin'
Write-Host ''
Write-Host 'To stop: double-click stop.bat'
Write-Host ''
$launchLock.Dispose()
