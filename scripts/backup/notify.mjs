import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export async function notifyBackupFailure() {
  // Only a fixed event is passed to the mailer, never SQL/error/config payloads.
  return new Promise(resolve => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass',
      '-File', fileURLToPath(new URL('./email.ps1', import.meta.url)), '-Event', 'backup_failed'],
    { windowsHide: true, timeout: 30000, maxBuffer: 4096 }, error => {
      if (error) console.error('Backup email alert unavailable; inspect local status.');
      resolve(!error);
    });
  });
}
