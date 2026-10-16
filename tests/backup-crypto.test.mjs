import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { encrypt, decrypt, inside } from '../scripts/backup/crypto.mjs';

test('backup encryption is authenticated and uses a fresh nonce', () => {
  const key = randomBytes(32), data = Buffer.from('private fixture');
  const a = encrypt(data, key), b = encrypt(data, key);
  assert.notDeepEqual(a, b);
  assert.deepEqual(decrypt(a, key), data);
  assert.ok(!a.includes(data));
  const tampered = Buffer.from(a); tampered[21] ^= 1;
  assert.throws(() => decrypt(tampered, key));
  assert.throws(() => decrypt(a, randomBytes(32)));
  assert.throws(() => decrypt(Buffer.from('not a backup'), key));
});
test('backup retention cannot address its root or escape into other folders', () => {
  const root = 'C:/Users/phamt/OneDrive/Desktop/Web-projects/backup/shoe-shop';
  assert.throws(() => inside(root, root));
  assert.throws(() => inside(root, root + '/../other-shop'));
  assert.throws(() => inside(root, 'C:/Windows'));
  assert.match(inside(root, root + '/objects/fixture.vbak'), /fixture\.vbak$/);
});
