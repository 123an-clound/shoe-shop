import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, stat, rm, utimes } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeEncrypted } from '../scripts/backup/crypto.mjs';
import { pruneBackups } from '../scripts/backup/retention.mjs';

test('retention preserves shared/current objects and unrelated files while removing expired snapshots', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'shoe-backup-retention-')), key = randomBytes(32);
  try {
    await mkdir(path.join(root, 'runs')); await mkdir(path.join(root, 'objects'));
    const previous = path.join(root, 'runs', '20250101T000000Z'), current = path.join(root, 'runs', '20261016T000000Z');
    await mkdir(previous); await mkdir(current);
    for (const [directory, finishedAt, blobs] of [[previous, '2025-01-01T00:00:00Z', ['a', 'c']], [current, new Date().toISOString(), ['b', 'c']]]) {
      await writeFile(path.join(directory, 'summary.json'), JSON.stringify({ completed: true, finishedAt }));
      await writeFile(path.join(directory, 'database.vbak'), 'encrypted-fixture');
      await writeEncrypted(path.join(directory, 'manifest.vbak'), Buffer.from(JSON.stringify({ format: 1, runId: path.basename(directory), databaseTakenAt: finishedAt, media: blobs.map(c => ({ blob: c.repeat(64) })) })), key);
    }
    for (const c of ['a', 'b', 'c']) {
      const file = path.join(root, 'objects', c.repeat(64) + '.vbak');
      await writeFile(file, 'encrypted-fixture'); await utimes(file, new Date(0), new Date(0));
    }
    await writeFile(path.join(root, 'objects', 'keep.txt'), 'unrelated');
    await pruneBackups(root, key, 30);
    await assert.rejects(stat(previous), { code: 'ENOENT' });
    await assert.rejects(stat(path.join(root, 'objects', 'a'.repeat(64) + '.vbak')), { code: 'ENOENT' });
    assert.ok((await stat(current)).isDirectory());
    for (const c of ['b', 'c']) assert.ok((await stat(path.join(root, 'objects', c.repeat(64) + '.vbak'))).isFile());
    assert.equal(await readFile(path.join(root, 'objects', 'keep.txt'), 'utf8'), 'unrelated');
    // An editable summary timestamp cannot expire a recent authenticated backup.
    await writeFile(path.join(current, 'summary.json'), JSON.stringify({ completed: true, finishedAt: '2025-01-01T00:00:00Z' }));
    await pruneBackups(root, key, 30);
    assert.ok((await stat(path.join(current, 'database.vbak'))).isFile());
    const oldest = path.join(root, 'runs', '20240101T000000Z');
    await mkdir(oldest);
    await writeFile(path.join(oldest, 'summary.json'), JSON.stringify({ completed: true }));
    await writeFile(path.join(oldest, 'database.vbak'), 'encrypted-fixture');
    await writeEncrypted(path.join(oldest, 'manifest.vbak'), Buffer.from(JSON.stringify({ format: 1, runId: path.basename(oldest), databaseTakenAt: '2024-01-01T00:00:00Z', media: [] })), key);
    await writeFile(path.join(oldest, 'do-not-delete.txt'), 'unrelated');
    await assert.rejects(pruneBackups(root, key, 30), /Unexpected file/);
    assert.ok((await stat(path.join(oldest, 'database.vbak'))).isFile());
  } finally {
    // Only this uniquely-created, verified temp directory contains test fixtures.
    const absolute = path.resolve(root), temp = path.resolve(os.tmpdir()) + path.sep;
    assert.ok(absolute.startsWith(temp) && path.basename(absolute).startsWith('shoe-backup-retention-'));
    await rm(absolute, { recursive: true, force: true });
  }
});
