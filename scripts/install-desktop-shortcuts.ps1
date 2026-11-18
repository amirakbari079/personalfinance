#Requires -Version 5.1
param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

# 1. Ensure Icon
$icoPath = Join-Path $Root 'assets\app.ico'
if (-not (Test-Path -LiteralPath $icoPath) -or $Force) {
    Write-Host 'Generating app icon...'
    & "$PSScriptRoot\generate-icon.ps1"
}

# 2. Ensure Executables
$exePath = Join-Path $Root 'PersonalFinance.exe'
$stopExePath = Join-Path $Root 'PersonalFinance-Stop.exe'
if (-not (Test-Path -LiteralPath $exePath) -or -not (Test-Path -LiteralPath $stopExePath) -or $Force) {
    Write-Host 'Building native launcher executables...'
    & "$PSScriptRoot\build-launcher.ps1"
}

$WshShell = New-Object -ComObject WScript.Shell

# 3. Create Desktop Shortcut
$desktopDir = [Environment]::GetFolderPath('Desktop')
$desktopShortcutPath = Join-Path $desktopDir 'PersonalFinance.lnk'
$shortcut = $WshShell.CreateShortcut($desktopShortcutPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $Root
$shortcut.IconLocation = "$icoPath,0"
$shortcut.Description = 'Personal & Business Finance Application'
$shortcut.Save()
Write-Host "Created Desktop Shortcut: $desktopShortcutPath" -ForegroundColor Green

# 4. Create Start Menu Program Folder & Shortcuts
$startMenuDir = Join-Path ([Environment]::GetFolderPath('Programs')) 'PersonalFinance'
if (-not (Test-Path -LiteralPath $startMenuDir)) {
    New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null
}

# Start Menu - App
$startAppPath = Join-Path $startMenuDir 'PersonalFinance.lnk'
$sApp = $WshShell.CreateShortcut($startAppPath)
$sApp.TargetPath = $exePath
$sApp.WorkingDirectory = $Root
$sApp.IconLocation = "$icoPath,0"
$sApp.Description = 'PersonalFinance Launcher'
$sApp.Save()

# Start Menu - Stop
$startStopPath = Join-Path $startMenuDir 'PersonalFinance-Stop.lnk'
$sStop = $WshShell.CreateShortcut($startStopPath)
$sStop.TargetPath = $stopExePath
$sStop.WorkingDirectory = $Root
$sStop.IconLocation = "$icoPath,0"
$sStop.Description = 'Stop PersonalFinance Services'
$sStop.Save()

Write-Host "Created Start Menu entries in: $startMenuDir" -ForegroundColor Green
Write-Host 'Installation of Desktop and Start Menu shortcuts complete!' -ForegroundColor Cyan
