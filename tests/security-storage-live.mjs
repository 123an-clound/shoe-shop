// Explicit opt-in: authenticated probes in the shop's private quarantine only.
// Never run automatically in CI or as part of npm test.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { verifyStagedProductVideo } from '../src/lib/productVideo.ts';

try { process.loadEnvFile('.env.local'); } catch { /* CI/operator can supply environment directly. */ }
const url=process.env.NEXT_PUBLIC_SUPABASE_URL, anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret=process.env.VELOCE_SECURITY_KEY, email=process.env.VELOCE_ADMIN_EMAIL, password=process.env.VELOCE_ADMIN_PASSWORD;
if (!url?.startsWith('https://') || !anon || !secret || !email || !password) throw new Error('Live probe configuration missing; credential values suppressed.');
const sb=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{'x-veloce-server-token':secret}}});
const paths=[];
let authenticated=false,stage='authenticate';
try {
  const {data:authData,error:authError}=await sb.auth.signInWithPassword({email,password});
  if(authError)throw new Error('Authentication rejected');
  authenticated=true;
  stage='public-write-denial';
  const untrusted=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${authData.session.access_token}`}}});
  const publicProbe=`videos/security-review-${crypto.randomUUID()}.mp4`;
  const {error:publicError}=await untrusted.storage.from('veloce').upload(publicProbe,new Uint8Array([0,0,0,12,102,116,121,112,109,112,52,50]),{contentType:'video/mp4'});
  try {
    assert.ok(publicError,'Admin Storage write without trusted server header was accepted');
    assert.match(publicError.message,/row.level security/i,'Expected an explicit RLS denial');
    console.log('PASS: real admin JWT without trusted header cannot write the public bucket');
  } finally {
    const {error:cleanupError}=await sb.storage.from('veloce').remove([publicProbe]);
    if(cleanupError)throw new Error('Public probe cleanup failed');
  }
  const bucket=sb.storage.from('veloce-uploads');
  stage='allowed-video';
  const {data:existing,error:listError}=await sb.storage.from('veloce').list('videos',{limit:100});
  assert.ok(!listError);
  const sample=existing.find(file=>/\.(mp4|webm)$/.test(file.name));
  assert.ok(sample,'A pre-existing product video is required for the allowed sample');
  const path=`videos/security-review-${crypto.randomUUID()}.${sample.name.split('.').at(-1)}`;paths.push(path);
  const {error:copyError}=await sb.storage.from('veloce').copy('videos/'+sample.name,path,{destinationBucket:'veloce-uploads'});
  assert.ok(!copyError,'Private copy failed');
  await verifyStagedProductVideo(path,sb);
  const publicResponse=await fetch(`${url}/storage/v1/object/public/veloce-uploads/${path}`);
  await publicResponse.arrayBuffer();assert.notEqual(publicResponse.status,200);
  console.log('PASS: allowed video verified in private quarantine; public read denied');
  stage='mime-rejection';
  const badMime=`videos/security-review-${crypto.randomUUID()}.mp4`;paths.push(badMime);
  const {error:mimeError}=await bucket.upload(badMime,new Uint8Array([60,104,116,109,108,62]),{contentType:'text/html'});
  assert.ok(mimeError,'Storage accepted an unlisted MIME');
  stage='signature-rejection';
  const mismatch=`videos/security-review-${crypto.randomUUID()}.mp4`;paths.push(mismatch);
  const {error:mismatchError}=await bucket.upload(mismatch,new Uint8Array([60,104,116,109,108,62]),{contentType:'video/mp4'});
  assert.ok(!mismatchError,'Quarantine upload failed');
  await assert.rejects(verifyStagedProductVideo(mismatch,sb));
  console.log('PASS: unlisted MIME denied by Storage and spoofed video rejected before publication');
  stage='size-rejection';
  const large=`videos/security-review-${crypto.randomUUID()}.mp4`;paths.push(large);
  const {error:sizeError}=await bucket.upload(large,new Uint8Array(50*1024*1024+1),{contentType:'video/mp4'});
  assert.ok(sizeError,'Storage accepted an oversized object');
  console.log('PASS: real Storage rejects a 50 MiB + 1 byte request');
} catch(error) {
  console.error(JSON.stringify({check:'private-storage-live',failedStage:stage,errorType:error.name,details:'suppressed to protect credentials'}));
  process.exitCode=1;
} finally {
  if(authenticated){
    if(paths.length){const {error}=await sb.storage.from('veloce-uploads').remove(paths);if(error){console.error('Private probe cleanup failed; inspect security-review paths.');process.exitCode=1;}}
    const {error}=await sb.auth.signOut({scope:'local'});if(error){console.error('Probe sign-out failed');process.exitCode=1;}
  }
}
