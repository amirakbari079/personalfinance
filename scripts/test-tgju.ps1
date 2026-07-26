$headers = @{
  "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  "Referer"    = "https://www.tgju.org/"
  "Accept"     = "application/json"
}

Write-Host "=== call5.tgju.org/ajax.json ==="
try {
  $j = Invoke-RestMethod -Uri "https://call5.tgju.org/ajax.json" -Headers $headers -TimeoutSec 30
  $g = $j.current.geram18
  $d = $j.current.price_dollar_rl
  Write-Host "geram18: $($g | ConvertTo-Json -Compress)"
  Write-Host "price_dollar_rl: $($d | ConvertTo-Json -Compress)"
  if ($g.p) {
    $rial = [decimal]($g.p -replace ',','')
    Write-Host "gold rial=$rial toman=$([math]::Round($rial/10))"
  }
  if ($d.p) {
    $rial = [decimal]($d.p -replace ',','')
    Write-Host "usd rial=$rial toman=$([math]::Round($rial/10))"
  }
} catch {
  Write-Host "ajax FAILED: $($_.Exception.Message)"
}

Write-Host "`n=== table geram18 row0 ==="
try {
  $t = Invoke-RestMethod -Uri "https://api.tgju.org/v1/market/indicator/summary-table-data/geram18" -Headers $headers -TimeoutSec 30
  Write-Host ($t.data[0] -join " | ")
} catch {
  Write-Host "table FAILED: $($_.Exception.Message)"
}
