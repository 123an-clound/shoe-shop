import { createHash } from 'node:crypto';

// MD5 is only a compatibility check against Supabase's source ETag; archives
// use SHA-256 for content identity and AES-256-GCM for authentication.
export function verifySourceMedia(bytes, metadata, httpEtag) {
  const size = metadata?.size ?? metadata?.contentLength;
  if (bytes.length > 50 * 1024 * 1024 || (size != null && bytes.length !== Number(size))) throw new Error('Source media size differs');
  const normalize = tag => typeof tag === 'string' ? tag.replace(/^W\//, '').replaceAll('"', '').toLowerCase() : null;
  const expected = normalize(metadata?.eTag ?? metadata?.etag);
  if (httpEtag !== undefined && expected && normalize(httpEtag) !== expected) throw new Error('Source media version differs');
  if (expected && /^[a-f0-9]{32}$/.test(expected) && createHash('md5').update(bytes).digest('hex') !== expected) throw new Error('Source media checksum differs');
}
