; Inno Setup Script for PersonalFinance Desktop Application
; Requires Inno Setup 6.x (https://jrsoftware.org/isdl.php)

#define MyAppName "PersonalFinance"
#define MyAppFaName "حسابداری شخصی"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "PersonalFinance Team"
#define MyAppExeName "PersonalFinance.exe"
#define MyAppStopExeName "PersonalFinance-Stop.exe"

[Setup]
AppId={{D4E93B12-781A-4C4B-A4B7-3E5591C68F20}
AppName={#MyAppFaName} ({#MyAppName})
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\{#MyAppName}
DefaultGroupName={#MyAppFaName}
DisableProgramGroupPage=yes
OutputDir=dist
OutputBaseFilename=PersonalFinance-Setup-v{#MyAppVersion}
SetupIconFile=..\assets\app.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayIcon={app}\assets\app.ico

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "ایجاد میانبر روی دسکتاپ (Create Desktop Shortcut)"; GroupDescription: "میانبرها:"
Name: "autostart"; Description: "اجرای خودکار هنگام ورود به ویندوز (Start on Windows login)"; GroupDescription: "تنظیمات سیستمی:"; Flags: unchecked

[Files]
; Root executables and scripts
Source: "..\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\{#MyAppStopExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\PersonalFinance.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\stop.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\.env.example"; DestDir: "{app}"; Flags: ignoreversion

; Assets and Icons
Source: "..\assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs

; Scripts
Source: "..\scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs

; Backend files
Source: "..\backend\pom.xml"; DestDir: "{app}\backend"; Flags: ignoreversion
Source: "..\backend\src\*"; DestDir: "{app}\backend\src"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\backend\target\*.jar"; DestDir: "{app}\backend\target"; Flags: ignoreversion skipifsourcedoesntexist

; Frontend files
Source: "..\frontend\package.json"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "..\frontend\package-lock.json"; DestDir: "{app}\frontend"; Flags: ignoreversion skipifsourcedoesntexist
Source: "..\frontend\next.config.ts"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "..\frontend\tsconfig.json"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "..\frontend\tailwind.config.ts"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "..\frontend\postcss.config.js"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "..\frontend\public\*"; DestDir: "{app}\frontend\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\frontend\src\*"; DestDir: "{app}\frontend\src"; Flags: ignoreversion recursesubdirs createallsubdirs

; Tools (Maven if packaged locally)
Source: "..\tools\*"; DestDir: "{app}\tools"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist

[Icons]
; Start Menu
Name: "{group}\{#MyAppFaName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\assets\app.ico"
Name: "{group}\توقف {#MyAppFaName}"; Filename: "{app}\{#MyAppStopExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\assets\app.ico"
Name: "{group}\حذف نصب {#MyAppFaName}"; Filename: "{uninstallexe}"

; Desktop
Name: "{autodesktop}\{#MyAppFaName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; IconFilename: "{app}\assets\app.ico"; Tasks: desktopicon

; Startup (if chosen)
Name: "{userstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: autostart

[Run]
; Copy .env.example to .env if .env doesn't exist
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -Command ""if (-not (Test-Path '{app}\.env')) { Copy-Item '{app}\.env.example' '{app}\.env' }"""; Flags: runhidden
; Option to launch after installation
Filename: "{app}\{#MyAppExeName}"; Description: "اجرای نرم‌افزار {#MyAppFaName}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; Gracefully stop running instances before uninstall
Filename: "{app}\{#MyAppStopExeName}"; Flags: runhidden
