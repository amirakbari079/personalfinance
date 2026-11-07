param(
    [string]$EnvFile,
    [string]$MavenPath = 'mvn',
    [string]$PostgresBin = 'E:/app/PostgreSQL/bin',
    [string]$Tests = 'LedgerIntegrationTest'
)
$ErrorActionPreference = 'Stop'
$pfRoot = Split-Path $PSScriptRoot -Parent
$pfDatabase = 'personalfinance_foundation_integration_test'
$pfOldPassword = $env:PGPASSWORD
$pfOldTestPassword = $env:PF_TEST_DB_PASSWORD
try {
    $pfPassword = $env:PF_TEST_DB_PASSWORD
    if (-not $pfPassword -and $EnvFile -and (Test-Path -LiteralPath $EnvFile)) {
        $pfLine = Get-Content -LiteralPath $EnvFile | Where-Object { $_ -match '^DB_PASSWORD=' } | Select-Object -First 1
        if ($pfLine) { $pfPassword = ($pfLine -replace '^DB_PASSWORD=', '').Trim().Trim('"').Trim("'") }
    }
    if (-not $pfPassword) {
        $pfConfig = Get-Content -LiteralPath (Join-Path $pfRoot 'backend/src/main/resources/application.yml') -Raw
        $pfPassword = [regex]::Match($pfConfig, 'DB_PASSWORD:([^}]+)').Groups[1].Value
    }
    if (-not $pfPassword) { throw 'Set PF_TEST_DB_PASSWORD for the isolated test database.' }
    $env:PGPASSWORD = $pfPassword
    $env:PF_TEST_DB_PASSWORD = $pfPassword
    $pfExists = & (Join-Path $PostgresBin 'psql.exe') -h 127.0.0.1 -U postgres -d postgres -At -c "select count(*) from pg_database where datname='$pfDatabase'"
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL test connection failed.' }
    if ($pfExists.Trim() -eq '0') {
        & (Join-Path $PostgresBin 'createdb.exe') -h 127.0.0.1 -U postgres $pfDatabase
        if ($LASTEXITCODE -ne 0) { throw 'Could not create the isolated test database.' }
    }
    # The test annotation fixes its own URL. Neither DB_URL nor the normal launcher is used.
    & $MavenPath -f (Join-Path $pfRoot 'backend/pom.xml') "-Dtest=$Tests" test -q
    $pfExitCode = $LASTEXITCODE
} finally {
    $env:PGPASSWORD = $pfOldPassword
    $env:PF_TEST_DB_PASSWORD = $pfOldTestPassword
}
exit $pfExitCode
