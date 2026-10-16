import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const magic = Buffer.from('VLCBAK01');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function readKey(keyPath) {
  const bytes = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', fileURLToPath(new URL('./key.ps1', import.meta.url)), '-Mode', 'Read', '-KeyPath', keyPath], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const key = Buffer.from(bytes.toString().trim(), 'base64');
  if (key.length !== 32) throw new Error('Backup key invalid');
  return key;
}
export function encrypt(bytes, key) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(magic);
  return Buffer.concat([magic, iv, cipher.update(bytes), cipher.final(), cipher.getAuthTag()]);
}
export function decrypt(bytes, key) {
  if (bytes.length < 36 || !bytes.subarray(0, 8).equals(magic)) throw new Error('Backup format invalid');
  const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(8, 20));
  decipher.setAAD(magic);
  decipher.setAuthTag(bytes.subarray(-16));
  return Buffer.concat([decipher.update(bytes.subarray(20, -16)), decipher.final()]);
}
export async function writeEncrypted(file, bytes, key) {
  const tmp = file + '.part';
  await writeFile(tmp, encrypt(bytes, key), { flag: 'wx' });
  await rename(tmp, file);
}
export const readEncrypted = async (file, key) => decrypt(await readFile(file), key);
export function inside(root, file) {
  const relative = path.relative(path.resolve(root), path.resolve(file));
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Backup path outside root');
  return path.resolve(file);
}
