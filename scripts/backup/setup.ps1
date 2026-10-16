param([string]$Destination='C:\Users\phamt\OneDrive\Desktop\Web-projects\backup')
$ErrorActionPreference = 'Stop'
$projectDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$approved = [IO.Path]::GetFullPath('C:\Users\phamt\OneDrive\Desktop\Web-projects\backup')
if ([IO.Path]::GetFullPath($Destination) -ne $approved) { throw 'Destination differs from the approved folder.' }
$stateRoot = Join-Path $env:LOCALAPPDATA 'ShoeShopBackup'
$root = Join-Path $approved 'shoe-shop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
function Protect-Directory([string]$Directory) {
  New-Item -ItemType Directory -Path $Directory -Force | Out-Null
  if ((Get-Item -LiteralPath $Directory).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Backup directory must not be a symlink or junction.' }
  $acl = New-Object Security.AccessControl.DirectorySecurity
  $acl.SetOwner($identity.User)
  $acl.SetAccessRuleProtection($true,$false)
  foreach ($sid in @($identity.User.Value,'S-1-5-18','S-1-5-32-544')) {
    $rule = New-Object Security.AccessControl.FileSystemAccessRule((New-Object Security.Principal.SecurityIdentifier($sid)),'FullControl','ContainerInherit,ObjectInherit','None','Allow')
    $acl.AddAccessRule($rule)
  }
  Set-Acl -LiteralPath $Directory -AclObject $acl
}
Protect-Directory $stateRoot
if (Test-Path -LiteralPath $root) {
  if (-not (Test-Path -LiteralPath (Join-Path $root '.backup-owner.json'))) { throw 'Existing folder has no backup ownership marker; nothing overwritten.' }
} else { Protect-Directory $root }
$marker = Join-Path $root '.backup-owner.json'
if (-not (Test-Path -LiteralPath $marker)) { [IO.File]::WriteAllText($marker,'{"format":1,"projectRef":"jtizooyjnllostamffpp"}') }
$keyPath = Join-Path $stateRoot 'key.dpapi'
if (-not (Test-Path -LiteralPath $keyPath) -and (Test-Path -LiteralPath (Join-Path $root 'runs'))) { throw 'Existing backups have no local key; recover the original key instead of generating a replacement.' }
& (Join-Path $PSScriptRoot 'key.ps1') -Mode Initialize -KeyPath $keyPath
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw 'Key initialization failed.' }
# Keep a version-pinned copy outside the disposable npm cache.
$tools = Join-Path $stateRoot 'tools'
New-Item -ItemType Directory -Path $tools -Force | Out-Null
$sourceTools = Join-Path $env:LOCALAPPDATA 'npm-cache\_npx\aa8e5c70f9d8d161\node_modules\@supabase\cli-windows-x64\bin'
foreach ($name in @('supabase.exe','supabase-go.exe')) {
  $source = Join-Path $sourceTools $name
  $target = Join-Path $tools $name
  if (-not (Test-Path -LiteralPath $source)) { throw 'The inspected Supabase CLI binary is missing.' }
  Copy-Item -LiteralPath $source -Destination $target -Force
  if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash) { throw 'CLI copy checksum failed.' }
}
$config = @{format=1;root=$root;projectRef='jtizooyjnllostamffpp';supabaseUrl='https://jtizooyjnllostamffpp.supabase.co';projectDir=$projectDir;cliBinary=(Join-Path $tools 'supabase.exe');keyPath=$keyPath;retentionDays=30}
[IO.File]::WriteAllText((Join-Path $stateRoot 'config.json'),($config | ConvertTo-Json))
Write-Output 'Encrypted backup destination and DPAPI key initialized. No data exported yet.'
