#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

function Test-PortListening([int]$Port) {
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Find-AppBrowser {
    $edgePaths = @(
        'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        (Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\Application\msedge.exe')
    )
    foreach ($p in $edgePaths) {
        if (Test-Path -LiteralPath $p) { return @{ Path = $p; Type = 'Edge' } }
    }

    $chromePaths = @(
        'C:\Program Files\Google\Chrome\Application\chrome.exe',
        'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')
    )
    foreach ($p in $chromePaths) {
        if (Test-Path -LiteralPath $p) { return @{ Path = $p; Type = 'Chrome' } }
    }

    return $null
}

$backendReady = Test-PortListening 8080
$frontendReady = Test-PortListening 3000

if (-not ($backendReady -and $frontendReady)) {
    # Start backend & frontend in the background without launching default browser tab
    $startScript = Join-Path $PSScriptRoot 'start.ps1'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$startScript" -NoBrowser
    $startExitCode = $LASTEXITCODE

    # Wait for frontend readiness
    $deadline = (Get-Date).AddSeconds(120)
    $ready = $false
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening 3000) {
            try {
                $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/login' -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($resp.StatusCode -eq 200) {
                    $ready = $true
                    break
                }
            } catch {}
        }
        Start-Sleep -Milliseconds 800
    }

    if (-not $ready) {
        Add-Type -AssemblyName System.Windows.Forms
        $backendLog = Join-Path $Root 'logs\backend.log'
        $errorMsg = "اجرای سرویس‌های پس‌زمینه با خطا مواجه شد.`n`n"
        if (Test-Path $backendLog) {
            $lastLines = Get-Content $backendLog -Tail 10 -ErrorAction SilentlyContinue
            if ($lastLines) {
                $errorMsg += "آخرین خطوط لاگ بک‌اند:`n" + ($lastLines -join "`n") + "`n`n"
            }
        }
        $errorMsg += "لطفاً بررسی کنید که دیتابیس PostgreSQL فعال است، یا فایل start.bat را دستی اجرا کنید."
        [System.Windows.Forms.MessageBox]::Show($errorMsg, "PersonalFinance - خطا در اجرا", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Error)
        exit 1
    }
}

# Open the standalone app window
$browser = Find-AppBrowser
$url = 'http://127.0.0.1:3000'
$profileDir = Join-Path $env:LOCALAPPDATA 'PersonalFinance\AppProfile'

if ($browser) {
    $args = @(
        "--user-data-dir=`"$profileDir`"",
        "--app=`"$url`"",
        "--app-id=PersonalFinance",
        "--window-size=1440,900"
    )
    Start-Process -FilePath $browser.Path -ArgumentList $args
} else {
    # Fallback to default system browser
    Start-Process $url
}
