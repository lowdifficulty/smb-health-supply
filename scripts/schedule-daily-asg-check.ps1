# Run ASG Google Sheet daily change check (register via Task Scheduler)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "ASG sheet check — $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
node scripts/check-asg-sheet.mjs --regenerate
$code = $LASTEXITCODE
if ($code -eq 2) {
  Write-Host "Changes detected."
} elseif ($code -eq 0) {
  Write-Host "No changes."
} else {
  Write-Host "Check failed (exit $code)."
}
exit $code
