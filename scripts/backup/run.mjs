import { readFile, writeFile, mkdir, stat, lstat, unlink, open } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { snapshot, restoreInMemory, query } from './database.mjs';
import { readKey, sha256, inside, writeEncrypted, readEncrypted } from './crypto.mjs';
import { pruneBackups } from './retention.mjs';
import { backupDue } from './due.mjs';
import { verifySourceMedia } from './media.mjs';
import { notifyBackupFailure } from './notify.mjs';

const stateRoot = path.join(process.env.LOCALAPPDATA ?? '', 'ShoeShopBackup');
const configPath = path.join(stateRoot, 'config.json');
let stage = 'configuration', key, lock, config;
const started = new Date();
const runId = started.toISOString().replaceAll(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const invoked = process.argv.includes('--run-if-due');
const restoreOnly = process.argv.includes('--verify-latest');

async function json(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function status(value) {
  await writeFile(path.join(stateRoot, 'status.json'), JSON.stringify(value, null, 2));
  if (config) await writeFile(path.join(config.root, 'status.json'), JSON.stringify(value, null, 2));
}
async function safeDirectory(root, directory) {
  inside(root, directory);
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Backup directory invalid');
}
async function verify(runDirectory) {
  const verificationStarted = Date.now();
  const manifest = JSON.parse((await readEncrypted(path.join(runDirectory, 'manifest.vbak'), key)).toString());
  const bytes = await readEncrypted(path.join(runDirectory, 'database.vbak'), key);
  if (sha256(bytes) !== manifest.databaseHash) throw new Error('Database backup checksum mismatch');
  stage = 'restore-database';
  const database = JSON.parse(bytes.toString());
  const restored = await restoreInMemory(database, PGlite);
  if (manifest.media.length !== database.objects.length) throw new Error('Media manifest is incomplete');
  const sourceObjects = new Map(database.objects.map(o => [o.bucket + '/' + o.name, o]));
  stage = 'verify-media';
  let bytesChecked = 0;
  for (const item of manifest.media) {
    if (!/^[a-f0-9]{64}$/.test(item.blob)) throw new Error('Media reference invalid');
    const media = await readEncrypted(inside(config.root, path.join(config.root, 'objects', item.blob + '.vbak')), key);
    if (media.length !== item.size || sha256(media) !== item.sha256) throw new Error('Media backup checksum mismatch');
    const source = sourceObjects.get(item.bucket + '/' + item.name);
    if (!source) throw new Error('Media has no source record');
    verifySourceMedia(media, source.metadata);
    bytesChecked += media.length;
  }
  return { restored, mediaVerified: manifest.media.length, bytesChecked, databaseTakenAt: manifest.databaseTakenAt, verificationSeconds: (Date.now() - verificationStarted) / 1000 };
}

try {
  config = await json(configPath);
  const expectedRoot = path.resolve('C:/Users/phamt/OneDrive/Desktop/Web-projects/backup/shoe-shop');
  if (path.resolve(config.root) !== expectedRoot || config.projectRef !== 'jtizooyjnllostamffpp') throw new Error('Backup configuration scope invalid');
  const marker = await json(path.join(config.root, '.backup-owner.json'));
  if (marker.projectRef !== config.projectRef || marker.format !== 1) throw new Error('Backup ownership marker invalid');
  await safeDirectory(path.dirname(config.root), config.root);
  for (const name of ['runs', 'objects']) { await mkdir(path.join(config.root, name), { recursive: true }); await safeDirectory(config.root, path.join(config.root, name)); }
  const lockPath = path.join(stateRoot, 'run.lock');
  try { lock = await open(lockPath, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') { console.log('Backup already running or needs stale-lock inspection.'); process.exit(2); } throw error; }
  await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: started.toISOString() }));
  const last = await json(path.join(stateRoot, 'latest.json')).catch(() => ({}));
  if (invoked && last.completed && !backupDue(last.finishedAt)) {
    console.log('A verified backup already exists for the current daily 03:00 cycle.');
  } else {
    key = readKey(config.keyPath);
    if (restoreOnly) {
      if (!/^\d{8}T\d{6}Z$/.test(last.runId ?? '')) throw new Error('No completed backup to verify');
      const result = await verify(inside(config.root, path.join(config.root, 'runs', last.runId)));
      await writeFile(path.join(stateRoot, 'restore-test.json'), JSON.stringify({ testedAt: new Date().toISOString(), runId: last.runId, ...result }, null, 2));
      console.log(JSON.stringify({ verified: true, tables: Object.keys(result.restored.counts).length, media: result.mediaVerified, bytes: result.bytesChecked, verificationSeconds: result.verificationSeconds }));
    } else {
      await status({ completed: false, running: true, runId, startedAt: started.toISOString() });
      stage = 'snapshot';
      const data = await snapshot(config);
      stage = 'restore-preflight';
      await restoreInMemory(data, PGlite);
      const directory = inside(config.root, path.join(config.root, 'runs', runId));
      await mkdir(directory); // Never overwrite an existing run.
      const databaseBytes = Buffer.from(JSON.stringify(data));
      await writeEncrypted(path.join(directory, 'database.vbak'), databaseBytes, key);
      const previous = last.completed && /^\d{8}T\d{6}Z$/.test(last.runId ?? '')
        ? JSON.parse((await readEncrypted(path.join(config.root, 'runs', last.runId, 'manifest.vbak'), key)).toString()) : { media: [] };
      const old = new Map(previous.media.map(item => [item.bucket + '/' + item.name, item]));
      const media = [];
      stage = 'download-media';
      let next = 0, downloaded = 0;
      const worker = async () => {
        while (next < data.objects.length) {
          const object = data.objects[next++];
          if (object.bucket !== 'veloce' || typeof object.name !== 'string' || object.name.split('/').some(p => p === '..' || p === '.') || object.name.includes('\\')) throw new Error('Media scope invalid');
          const version = sha256(Buffer.from(JSON.stringify({ id: object.id, updatedAt: object.updatedAt, metadata: object.metadata })));
          const cached = old.get(object.bucket + '/' + object.name);
          if (cached?.version === version && await stat(path.join(config.root, 'objects', cached.blob + '.vbak')).then(s => s.isFile()).catch(() => false)) { media.push(cached); continue; }
          const resource = new URL('/storage/v1/object/public/veloce/' + object.name.split('/').map(encodeURIComponent).join('/'), config.supabaseUrl);
          if (resource.origin !== new URL(config.supabaseUrl).origin || !resource.pathname.startsWith('/storage/v1/object/public/veloce/')) throw new Error('Media origin invalid');
          resource.searchParams.set('cacheNonce', version);
          const response = await fetch(resource, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(60000) });
          if (!response.ok || Number(response.headers.get('content-length') ?? 0) > 50 * 1024 * 1024) throw new Error('Media download failed');
          const bytes = Buffer.from(await response.arrayBuffer());
          verifySourceMedia(bytes, object.metadata, response.headers.get('etag'));
          const hash = sha256(bytes), blob = sha256(Buffer.from(object.bucket + '/' + object.name + ':' + hash));
          const target = inside(config.root, path.join(config.root, 'objects', blob + '.vbak'));
          if (!await stat(target).then(s => s.isFile()).catch(() => false)) await writeEncrypted(target, bytes, key);
          media.push({ bucket: object.bucket, name: object.name, version, blob, sha256: hash, size: bytes.length });
          downloaded++;
          if (downloaded % 100 === 0) console.log(JSON.stringify({ downloaded, total: data.objects.length }));
        }
      };
      const results = await Promise.allSettled(Array.from({ length: 4 }, worker));
      if (results.some(r => r.status === 'rejected')) throw new Error('Media backup incomplete');
      media.sort((a, b) => a.name.localeCompare(b.name));
      stage = 'media-snapshot-consistency';
      const current = (await query(config, `select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'bucket',o.bucket_id,'name',o.name,'updatedAt',o.updated_at,'metadata',o.metadata) order by o.name),'[]'::jsonb) as objects from storage.objects o where o.bucket_id='veloce'`))[0].objects;
      if (JSON.stringify(current) !== JSON.stringify(data.objects)) throw new Error('Media changed during backup; retry for a consistent snapshot');
      const manifest = { format: 1, runId, projectRef: config.projectRef, databaseHash: sha256(databaseBytes), databaseTakenAt: data.takenAt,
        excluded: ['other applications', 'live auth sessions', 'transient rate counters', 'private unfinished upload quarantine', 'provider OAuth/SMTP/JWT secrets'], media };
      await writeEncrypted(path.join(directory, 'manifest.vbak'), Buffer.from(JSON.stringify(manifest)), key);
      const result = await verify(directory);
      const summary = { completed: true, runId, finishedAt: new Date().toISOString(), startedAt: started.toISOString(),
        databaseTakenAt: data.takenAt, tablesRestored: Object.keys(result.restored.counts).length, functionsRestored: result.restored.functions,
        policiesRestored: result.restored.policies, mediaVerified: result.mediaVerified, bytesVerified: result.bytesChecked, downloaded,
        backupAndVerifySeconds: Math.round((Date.now() - started.getTime()) / 1000), restoreTestSeconds: result.verificationSeconds, encrypted: 'AES-256-GCM', keyProtection: 'Windows DPAPI CurrentUser' };
      await writeFile(path.join(directory, 'summary.json'), JSON.stringify(summary, null, 2));
      await status(summary);
      await writeFile(path.join(stateRoot, 'latest.json'), JSON.stringify(summary, null, 2));
      stage = 'retention';
      await pruneBackups(config.root, key, config.retentionDays);
      console.log(JSON.stringify(summary));
    }
  }
} catch (error) {
  const failure = { completed: false, running: false, runId, failedAt: new Date().toISOString(), failedStage: stage, errorType: error?.name ?? 'Error', code: typeof error?.code === 'string' && /^[A-Z0-9_]{1,32}$/.test(error.code) ? error.code : undefined, details: 'suppressed to protect backup data' };
  await status(failure).catch(() => {});
  if (config) {
    const directory = path.join(config.root, 'runs', runId);
    if (await stat(directory).then(s => s.isDirectory()).catch(() => false)) await writeFile(inside(config.root, path.join(directory, 'summary.json')), JSON.stringify(failure, null, 2)).catch(() => {});
  }
  console.error(JSON.stringify(failure));
  await notifyBackupFailure();
  process.exitCode = 1;
} finally {
  key?.fill(0);
  if (lock) { await lock.close(); await unlink(path.join(stateRoot, 'run.lock')).catch(() => {}); }
}
