' PersonalFinance Silent Launcher
Set WshShell = CreateObject("WScript.Shell")
strCurrentDir = WshShell.CurrentDirectory
strScript = strCurrentDir & "\scripts\launch-app.ps1"
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strScript & """", 0, False
Set WshShell = Nothing
