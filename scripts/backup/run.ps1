param([switch]$IfDue)
$ErrorActionPreference = 'Stop'
$stateRoot = Join-Path $env:LOCALAPPDATA 'ShoeShopBackup'
try {
  $config = Get-Content -LiteralPath (Join-Path $stateRoot 'config.json') -Raw | ConvertFrom-Json
  $script = Join-Path $config.projectDir 'scripts\backup\run.mjs'
  $arguments = @($script)
  if ($IfDue) { $arguments += '--run-if-due' }
  $ErrorActionPreference = 'Continue'
  & 'C:\Program Files\nodejs\node.exe' @arguments 2>&1 | Out-File -LiteralPath (Join-Path $stateRoot 'last-run.log') -Encoding utf8
  $result = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  $health = @{completed=($result -eq 0);exitCode=$result;finishedAt=[DateTime]::UtcNow.ToString('o')}
  [IO.File]::WriteAllText((Join-Path $stateRoot 'scheduler-status.json'),($health | ConvertTo-Json))
  exit $result
} catch {
  [IO.File]::WriteAllText((Join-Path $stateRoot 'scheduler-error.json'),'{"completed":false,"event":"backup_scheduler_failed","details":"suppressed"}')
  & powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'email.ps1') -Event backup_scheduler_failed 2>&1 | Out-Null
  exit 1
}
