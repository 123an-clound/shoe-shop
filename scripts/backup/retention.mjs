import { readFile, readdir, lstat, unlink, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { inside, readEncrypted } from './crypto.mjs';

async function removeRun(root, directory) {
  inside(root, directory);
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Retention directory invalid');
  const entries = await readdir(directory);
  if (entries.some(n => !['database.vbak', 'manifest.vbak', 'summary.json'].includes(n))) throw new Error('Unexpected file prevents retention removal');
  for (const name of entries) {
    const target = inside(root, path.join(directory, name));
    const entry = await lstat(target);
    if (!entry.isFile() || entry.isSymbolicLink()) throw new Error('Retention file invalid');
  }
  for (const name of entries) await unlink(inside(root, path.join(directory, name)));
  await rmdir(directory);
}
export async function pruneBackups(root, key, retentionDays) {
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 365) throw new Error('Retention interval invalid');
  const runsRoot = inside(root, path.join(root, 'runs')), candidates = [];
  for (const name of await readdir(runsRoot)) {
    if (!/^\d{8}T\d{6}Z$/.test(name)) continue;
    const directory = inside(root, path.join(runsRoot, name));
    const info = await lstat(directory);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Retention run invalid');
    const summary = JSON.parse(await readFile(path.join(directory, 'summary.json'), 'utf8'));
    if (!summary.completed) continue;
    const manifest = JSON.parse((await readEncrypted(path.join(directory, 'manifest.vbak'), key)).toString());
    if (manifest.format !== 1 || manifest.runId !== name || !Number.isFinite(Date.parse(manifest.databaseTakenAt))) throw new Error('Retention manifest invalid');
    candidates.push({ directory, manifest, timestamp: Date.parse(manifest.databaseTakenAt) });
  }
  candidates.sort((a, b) => b.timestamp - a.timestamp);
  const retained = candidates.filter((c, i) => i === 0 || Date.now() - c.timestamp <= retentionDays * 86400000);
  const expired = candidates.filter(c => !retained.includes(c));
  const referenced = new Set();
  for (const { manifest } of retained) {
    for (const item of manifest.media) {
      if (!/^[a-f0-9]{64}$/.test(item.blob)) throw new Error('Retention blob reference invalid');
      referenced.add(item.blob + '.vbak');
    }
  }
  // Authenticate every completed manifest before deleting anything, and always
  // keep the newest completed snapshot even if the machine was offline >30 days.
  for (const candidate of expired) await removeRun(root, candidate.directory);
  for (const name of await readdir(path.join(root, 'objects'))) {
    if (!/^[a-f0-9]{64}\.vbak$/.test(name) || referenced.has(name)) continue;
    const target = inside(root, path.join(root, 'objects', name)), info = await lstat(target);
    if (!info.isFile() || info.isSymbolicLink()) throw new Error('Retention object invalid');
    if (Date.now() - info.mtimeMs > 86400000) await unlink(target);
  }
}
