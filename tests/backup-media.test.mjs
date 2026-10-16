import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifySourceMedia } from '../scripts/backup/media.mjs';

test('backup rejects a stale same-length CDN object against its recorded source ETag', () => {
  const source = Buffer.from('new-image'), stale = Buffer.from('old-image');
  const eTag = createHash('md5').update(source).digest('hex');
  assert.doesNotThrow(() => verifySourceMedia(source, { size: source.length, eTag }, '"' + eTag + '"'));
  assert.throws(() => verifySourceMedia(stale, { size: source.length, eTag }), /checksum/);
  assert.throws(() => verifySourceMedia(source, { size: source.length, eTag }, '"other-version"'), /version/);
  assert.throws(() => verifySourceMedia(source, { size: 1, eTag }), /size/);
});
