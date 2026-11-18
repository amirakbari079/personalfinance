#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

Write-Host 'Checking prerequisites for installer...' -ForegroundColor Cyan

# 1. Build launcher executables and icon
& "$PSScriptRoot\generate-icon.ps1"
& "$PSScriptRoot\build-launcher.ps1"

# 2. Locate Inno Setup Compiler (ISCC.exe)
$isccPaths = @(
    'C:\Program Files (x86)\Inno Setup 6\ISCC.exe',
    'C:\Program Files\Inno Setup 6\ISCC.exe',
    'C:\Program Files (x86)\Inno Setup 5\ISCC.exe'
)
$iscc = Get-Command iscc.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $iscc) {
    foreach ($p in $isccPaths) {
        if (Test-Path -LiteralPath $p) { $iscc = $p; break }
    }
}

$issFile = Join-Path $Root 'installer\setup.iss'
if (-not (Test-Path -LiteralPath $issFile)) {
    throw "Inno Setup script not found at $issFile"
}

if ($iscc) {
    Write-Host "Found Inno Setup Compiler at: $iscc" -ForegroundColor Green
    Write-Host 'Compiling installer package...'
    & $iscc "$issFile"
    Write-Host 'Installer built successfully in installer\dist\' -ForegroundColor Green
} else {
    Write-Host ''
    Write-Host 'Inno Setup compiler (ISCC.exe) was not found on this system.' -ForegroundColor Yellow
    Write-Host 'To build the single-file setup executable:' -ForegroundColor Yellow
    Write-Host '  1. Download and install Inno Setup 6 (free): https://jrsoftware.org/isdl.php'
    Write-Host "  2. Run this script again, or right-click 'installer\setup.iss' -> Compile."
    Write-Host ''
    Write-Host 'Meanwhile, you can use the instant Desktop Shortcut:' -ForegroundColor Green
    Write-Host '  Run: scripts\install-desktop-shortcuts.ps1'
    Write-Host '  Double-click PersonalFinance.exe on your Desktop!'
}
