import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/backup/email.ps1', import.meta.url));
async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'shoe-shop-email-test-'));
  const state = path.join(root, 'ShoeShopBackup');
  await mkdir(state);
  await writeFile(path.join(state, 'email-recipient.json'), JSON.stringify({ format: 1, recipient: 'alerts@example.invalid' }));
  try { await run(root, state); } finally {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('shoe-shop-email-test-'));
    await rm(root, { recursive: true, force: true });
  }
}
function send(root) {
  return spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-Event', 'test'],
    { env: { ...process.env, LOCALAPPDATA: root }, encoding: 'utf8', windowsHide: true, timeout: 10000 });
}

test('missing mail credentials fail closed without claiming delivery', { skip: process.platform !== 'win32' }, async () => {
  await fixture(async root => {
    const result = send(root);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /not configured/);
    assert.doesNotMatch(result.stdout, /accepted/);
  });
});

test('recipient changes and unencrypted SMTP are blocked before reading credentials', { skip: process.platform !== 'win32' }, async () => {
  await fixture(async (root, state) => {
    const baseline = { format: 1, recipient: 'alerts@example.invalid', smtpHost: 'smtp.example.invalid', port: 587, startTls: true, sender: 'sender@example.invalid' };
    await writeFile(path.join(state, 'email-credential.xml'), 'SECRET-FIXTURE-DO-NOT-LOG');
    for (const change of [{ recipient: 'other@example.invalid' }, { startTls: false }, { port: 465 }, { smtpHost: 'smtp.example.invalid\r\nInjected' }]) {
      await writeFile(path.join(state, 'email.json'), JSON.stringify({ ...baseline, ...change }));
      const result = send(root);
      assert.equal(result.status, 1);
      assert.doesNotMatch(result.stdout + result.stderr, /SECRET-FIXTURE|other@example|Injected/);
      const status = JSON.parse(await readFile(path.join(state, 'email-status.json'), 'utf8'));
      assert.equal(status.smtpAccepted, false);
      assert.equal(status.details, 'suppressed');
    }
  });
});
