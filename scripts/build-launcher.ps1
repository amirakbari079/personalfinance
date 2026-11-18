#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) {
    $csc = 'C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe'
}
if (-not (Test-Path $csc)) {
    Write-Host 'csc.exe not found. Skipping C# launcher compilation.' -ForegroundColor Yellow
    exit 0
}

$icoPath = Join-Path $Root 'assets\app.ico'
if (-not (Test-Path $icoPath)) {
    & "$PSScriptRoot\generate-icon.ps1"
}

# 1. Main App Launcher
$launcherCs = Join-Path $Root 'scripts\PersonalFinanceLauncher.cs'
$launcherExe = Join-Path $Root 'PersonalFinance.exe'

$codeLauncher = @'
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PersonalFinanceLauncher {
    static class Program {
        [STAThread]
        static void Main(string[] args) {
            try {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string scriptPath = Path.Combine(baseDir, "scripts", "launch-app.ps1");
                if (!File.Exists(scriptPath)) {
                    MessageBox.Show("Launch script not found:\n" + scriptPath, "PersonalFinance Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + scriptPath + "\"";
                psi.WorkingDirectory = baseDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(psi);
            } catch (Exception ex) {
                MessageBox.Show("Failed to launch application:\n" + ex.Message, "PersonalFinance Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
'@

Set-Content -Path $launcherCs -Value $codeLauncher -Encoding UTF8
& $csc /nologo /target:winexe /win32icon:"$icoPath" /out:"$launcherExe" "$launcherCs"
if (Test-Path $launcherCs) { Remove-Item $launcherCs -Force }
Write-Host "Compiled: $launcherExe" -ForegroundColor Green

# 2. Stop App Launcher
$stopCs = Join-Path $Root 'scripts\PersonalFinanceStop.cs'
$stopExe = Join-Path $Root 'PersonalFinance-Stop.exe'

$codeStop = @'
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PersonalFinanceStop {
    static class Program {
        [STAThread]
        static void Main(string[] args) {
            try {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string scriptPath = Path.Combine(baseDir, "scripts", "stop.ps1");
                if (!File.Exists(scriptPath)) {
                    MessageBox.Show("Stop script not found:\n" + scriptPath, "PersonalFinance Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + scriptPath + "\"";
                psi.WorkingDirectory = baseDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process p = Process.Start(psi);
                p.WaitForExit(10000);
            } catch (Exception ex) {
                MessageBox.Show("Failed to stop application:\n" + ex.Message, "PersonalFinance Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
'@

Set-Content -Path $stopCs -Value $codeStop -Encoding UTF8
& $csc /nologo /target:winexe /win32icon:"$icoPath" /out:"$stopExe" "$stopCs"
if (Test-Path $stopCs) { Remove-Item $stopCs -Force }
Write-Host "Compiled: $stopExe" -ForegroundColor Green
