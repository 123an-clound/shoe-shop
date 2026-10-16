param(
  [ValidateSet('test','backup_failed','backup_scheduler_failed')][string]$Event='test'
)
$ErrorActionPreference = 'Stop'
$stateRoot = Join-Path $env:LOCALAPPDATA 'ShoeShopBackup'
$client = $null
$message = $null
try {
  $configPath = Join-Path $stateRoot 'email.json'
  $credentialPath = Join-Path $stateRoot 'email-credential.xml'
  if (-not (Test-Path -LiteralPath $configPath) -or -not (Test-Path -LiteralPath $credentialPath)) {
    [Console]::Error.WriteLine('Email alerts are not configured; no email sent.')
    exit 2
  }
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
  $approved = Get-Content -LiteralPath (Join-Path $stateRoot 'email-recipient.json') -Raw | ConvertFrom-Json
  $recipient = New-Object Net.Mail.MailAddress($approved.recipient)
  if ($approved.format -ne 1 -or $recipient.Address -cne $approved.recipient -or $config.format -ne 1 -or $config.recipient -cne $approved.recipient -or $config.port -ne 587 -or $config.startTls -ne $true -or $config.smtpHost -notmatch '^(?=.{1,253}$)[a-zA-Z0-9]+([a-zA-Z0-9.-]*[a-zA-Z0-9])?$') {
    throw 'Email configuration is invalid.'
  }
  $sender = New-Object Net.Mail.MailAddress($config.sender)
  if ($sender.Address -cne $config.sender) { throw 'Sender must be a single mailbox.' }
  $credential = Import-Clixml -LiteralPath $credentialPath
  if ($credential -isnot [Management.Automation.PSCredential]) { throw 'SMTP credential is invalid.' }
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $client = New-Object Net.Mail.SmtpClient($config.smtpHost,587)
  $client.EnableSsl = $true # Require STARTTLS and normal certificate validation.
  $client.UseDefaultCredentials = $false
  $client.Credentials = $credential.GetNetworkCredential()
  $client.Timeout = 20000
  $message = New-Object Net.Mail.MailMessage
  $message.From = $sender
  $message.To.Add($config.recipient)
  $message.Subject = '[shoe-shop] ' + $Event
  $message.Body = "Service: shoe-shop`r`nEvent: $Event`r`nUTC: $([DateTime]::UtcNow.ToString('o'))`r`nReference: $([Guid]::NewGuid().ToString())`r`n`r`nOpen docs/security-backup.md and inspect local status.json / scheduler-status.json. This email contains no backup, key, customer data, or raw error details."
  $message.BodyEncoding = [Text.Encoding]::UTF8
  $client.Send($message)
  $result = @{event=$Event;smtpAccepted=$true;inboxReceiptVerified=$false;sentAt=[DateTime]::UtcNow.ToString('o')}
  [IO.File]::WriteAllText((Join-Path $stateRoot 'email-status.json'),($result | ConvertTo-Json))
  Write-Output 'SMTP accepted the alert. Inbox receipt still needs confirmation.'
} catch {
  if (Test-Path -LiteralPath $stateRoot) {
    $result = @{event=$Event;smtpAccepted=$false;failedAt=[DateTime]::UtcNow.ToString('o');details='suppressed'}
    [IO.File]::WriteAllText((Join-Path $stateRoot 'email-status.json'),($result | ConvertTo-Json))
  }
  [Console]::Error.WriteLine('Email alert failed; details suppressed. Check local configuration and provider settings.')
  exit 1
} finally {
  if ($message) { $message.Dispose() }
  if ($client) { $client.Dispose() }
}
