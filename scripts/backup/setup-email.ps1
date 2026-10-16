param(
  [Parameter(Mandatory=$true)][string]$SmtpHost,
  [Parameter(Mandatory=$true)][string]$Username,
  [Parameter(Mandatory=$true)][string]$Sender
)
$ErrorActionPreference = 'Stop'
try {
  $stateRoot = Join-Path $env:LOCALAPPDATA 'ShoeShopBackup'
  if (-not (Test-Path -LiteralPath (Join-Path $stateRoot 'config.json'))) { throw 'Initialize the backup first.' }
  if ((Get-Item -LiteralPath $stateRoot).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'State directory must not be a symlink.' }
  if ($SmtpHost -notmatch '^(?=.{1,253}$)[a-zA-Z0-9]+([a-zA-Z0-9.-]*[a-zA-Z0-9])?$' -or [string]::IsNullOrWhiteSpace($Username) -or $Username -match '[\r\n]') { throw 'SMTP settings invalid.' }
  $mailbox = New-Object Net.Mail.MailAddress($Sender)
  if ($mailbox.Address -cne $Sender) { throw 'Sender must be a single mailbox.' }
  $approved = Get-Content -LiteralPath (Join-Path $stateRoot 'email-recipient.json') -Raw | ConvertFrom-Json
  $recipient = New-Object Net.Mail.MailAddress($approved.recipient)
  if ($approved.format -ne 1 -or $recipient.Address -cne $approved.recipient) { throw 'Approved recipient is invalid.' }
  # Reassert user/system/admin-only ACLs before writing the DPAPI credential.
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $acl = New-Object Security.AccessControl.DirectorySecurity
  $acl.SetOwner($identity.User)
  $acl.SetAccessRuleProtection($true,$false)
  foreach ($sid in @($identity.User.Value,'S-1-5-18','S-1-5-32-544')) {
    $rule = New-Object Security.AccessControl.FileSystemAccessRule((New-Object Security.Principal.SecurityIdentifier($sid)),'FullControl','ContainerInherit,ObjectInherit','None','Allow')
    $acl.AddAccessRule($rule)
  }
  Set-Acl -LiteralPath $stateRoot -AclObject $acl
  $password = Read-Host 'SMTP app password (hidden; do not paste it into chat)' -AsSecureString
  if ($password.Length -eq 0) { throw 'Empty credential.' }
  $credential = New-Object Management.Automation.PSCredential($Username,$password)
  # On Windows Export-Clixml encrypts PSCredential with DPAPI CurrentUser.
  $credential | Export-Clixml -LiteralPath (Join-Path $stateRoot 'email-credential.xml')
  $config = @{format=1;recipient=$approved.recipient;smtpHost=$SmtpHost;port=587;startTls=$true;sender=$Sender}
  [IO.File]::WriteAllText((Join-Path $stateRoot 'email.json'),($config | ConvertTo-Json))
  $password.Dispose()
  & powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'email.ps1') -Event test
  exit $LASTEXITCODE
} catch {
  [Console]::Error.WriteLine('Email setup failed; details suppressed. No credentials printed.')
  exit 1
}
