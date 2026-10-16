$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$stateRoot = Join-Path $env:LOCALAPPDATA 'ShoeShopBackup'
$config = Get-Content -LiteralPath (Join-Path $stateRoot 'config.json') -Raw | ConvertFrom-Json
if (-not (Test-Path -LiteralPath (Join-Path $stateRoot 'latest.json'))) { throw 'Create and verify the first backup before scheduling.' }
$latest = Get-Content -LiteralPath (Join-Path $stateRoot 'latest.json') -Raw | ConvertFrom-Json
if (-not $latest.completed) { throw 'The first backup is not verified.' }
$runner = Join-Path $config.projectDir 'scripts\backup\run.ps1'
$arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $runner + '" -IfDue'
$action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument $arguments -WorkingDirectory $config.projectDir
$daily = New-ScheduledTaskTrigger -Daily -At '03:00'
$logon = New-ScheduledTaskTrigger -AtLogOn -User $identity.Name
$principal = New-ScheduledTaskPrincipal -UserId $identity.User.Value -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 15) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -Hidden
$taskName = 'ShoeShop-EncryptedBackup'
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing -and $existing.Description -notlike 'Encrypted backup for shoe-shop jtizooyjnllostamffpp*') { throw 'A task with this name already exists and belongs to another setup.' }
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($daily,$logon) -Principal $principal -Settings $settings -Description 'Encrypted backup for shoe-shop jtizooyjnllostamffpp. Daily 03:00 local plus logon catch-up, current user only.' -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Output 'Scheduled task registered and started: daily 03:00 local, logon catch-up, current Windows user.'
