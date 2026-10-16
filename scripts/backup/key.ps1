param([Parameter(Mandatory=$true)][ValidateSet('Initialize','Read')][string]$Mode,
  [Parameter(Mandatory=$true)][string]$KeyPath)
$ErrorActionPreference = 'Stop'
try {
  Add-Type -AssemblyName System.Security
  $entropy = [Text.Encoding]::UTF8.GetBytes('shoe-shop-backup-v1-jtizooyjnllostamffpp')
  if ($Mode -eq 'Initialize' -and -not (Test-Path -LiteralPath $KeyPath)) {
    $key = New-Object byte[] 32
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($key)
    $rng.Dispose()
    $wrapped = [Security.Cryptography.ProtectedData]::Protect($key, $entropy, 'CurrentUser')
    [IO.File]::WriteAllBytes($KeyPath, $wrapped)
    [Array]::Clear($key, 0, $key.Length)
  }
  if ($Mode -eq 'Read') {
    $key = [Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($KeyPath), $entropy, 'CurrentUser')
    [Console]::Out.Write([Convert]::ToBase64String($key))
    [Array]::Clear($key, 0, $key.Length)
  }
} catch { [Console]::Error.WriteLine('Backup key operation failed; details suppressed.'); exit 1 }
