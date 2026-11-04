#Requires -Version 5.1
param([switch]$Disable)
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$path = Join-Path ([Environment]::GetFolderPath('Startup')) 'PersonalFinance.lnk'
if ($Disable) {
    if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path }
    Write-Host 'Automatic startup disabled.'
} else {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($path)
    $shortcut.TargetPath = (Get-Command powershell.exe).Source
    $shortcut.Arguments = "-NoProfile -WindowStyle Hidden -File `"$PSScriptRoot\start.ps1`" -NoBrowser"
    $shortcut.WorkingDirectory = $Root
    $shortcut.WindowStyle = 7
    $shortcut.Description = 'PersonalFinance local background startup'
    $shortcut.Save()
    Write-Host 'PersonalFinance will start after Windows sign-in.'
}
