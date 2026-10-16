// Explicit opt-in. Uses one real admin session; no customer messages or orders.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

try { process.loadEnvFile('.env.local'); } catch { /* Operator can supply env directly. */ }
if (process.env.SECURITY_LIVE_TEST !== '1') throw new Error('Set SECURITY_LIVE_TEST=1 for authorized deployment probes.');
const base = new URL(process.env.SECURITY_DEPLOYMENT_URL);
assert.equal(base.protocol, 'https:');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extra = bypass ? { 'x-vercel-protection-bypass': bypass } : {};
const request = (path, options = {}) => fetch(new URL(path, base), {
  redirect: 'manual', ...options, headers: { ...extra, ...options.headers },
});
let browser, context, page, signedIn = false, stage = 'https-headers';
try {
  for (const path of ['/', '/admin/dang-nhap', '/security-review-not-found']) {
    const response = await request(path);
    await response.arrayBuffer();
    assert.equal(response.status, path.includes('not-found') ? 404 : 200);
    assert.ok(response.headers.get('strict-transport-security')?.includes('max-age='));
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(response.headers.get('content-security-policy')?.includes("object-src 'none'"));
    assert.equal(response.headers.get('content-security-policy-report-only'), null);
  }
  const redirect = await fetch(new URL('/', base).href.replace(/^https:/, 'http:'), { redirect: 'manual' });
  await redirect.arrayBuffer();
  assert.ok([301, 302, 307, 308].includes(redirect.status));
  assert.ok(redirect.headers.get('location')?.startsWith('https://'));
  const cors = await request('/api/customer/session', { headers: { Origin: 'https://untrusted.invalid' } });
  await cors.arrayBuffer();
  assert.equal(cors.headers.get('access-control-allow-origin'), null);
  assert.ok(cors.headers.get('cache-control')?.includes('no-store'));
  console.log('PASS: valid HTTPS, HTTP redirect, enforced headers on 200/404 and cross-origin read denial');

  stage = 'admin-login';
  browser = await chromium.launch({ channel: 'chrome' });
  context = await browser.newContext(); // Never record traces or screenshots with credentials.
  await context.route(base.origin + '/**', route => route.continue({ headers: { ...route.request().headers(), ...extra } }));
  page = await context.newPage();
  await page.goto(new URL('/admin/dang-nhap', base).href, { waitUntil: 'networkidle' });
  await page.locator('input[name=email]').fill(process.env.VELOCE_ADMIN_EMAIL);
  await page.locator('input[name=password]').fill(process.env.VELOCE_ADMIN_PASSWORD);
  const actionRequest = page.waitForRequest(r => r.method() === 'POST' && !!r.headers()['next-action']);
  await page.locator('button[type=submit]').click();
  const action = await actionRequest;
  await page.waitForURL(url => url.pathname === '/admin', { timeout: 30000 });
  signedIn = true;
  stage = 'cookie-csrf';
  const auth = (await context.cookies(base.origin)).filter(c => /^sb-.*-auth-token(?:\.\d+)?$/.test(c.name));
  assert.ok(auth.length);
  for (const cookie of auth) {
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, 'Lax');
    assert.equal(cookie.path, '/');
    assert.ok(cookie.expires > Date.now() / 1000 && cookie.expires <= Date.now() / 1000 + 7 * 86400 + 60);
  }
  assert.equal(await page.evaluate(() => document.cookie.includes('-auth-token')), false);
  const cookieHeader = auth.map(c => `${c.name}=${c.value}`).join('; ');
  const crossOrigin = await request('/admin/dang-nhap', {
    method: 'POST', headers: { Origin: 'https://untrusted.invalid', 'Next-Action': action.headers()['next-action'],
      'Content-Type': 'text/plain;charset=UTF-8', Cookie: cookieHeader }, body: '[]',
  });
  await crossOrigin.arrayBuffer();
  assert.ok([400, 403, 500].includes(crossOrigin.status)); // Next rejects invalid Origin before running the action.
  console.log('PASS: real auth cookies HttpOnly/Secure/Lax/7-day bound; foreign-Origin action rejected');
  stage = 'logout-replay';
  await page.getByRole('button', { name: '\u0110\u0103ng xu\u1ea5t', exact: true }).click();
  await page.waitForURL(url => url.pathname === '/admin/dang-nhap', { timeout: 30000 });
  signedIn = false;
  const replay = await request('/admin', { headers: { Cookie: cookieHeader } });
  await replay.arrayBuffer();
  assert.equal(replay.status, 307);
  assert.equal(new URL(replay.headers.get('location'), base).pathname, '/admin/dang-nhap');
  console.log('PASS: revoked real auth cookie denied at protected endpoint after logout');
} catch {
  console.error(JSON.stringify({ check: 'deployment-security', failedStage: stage, details: 'suppressed to protect credentials' }));
  process.exitCode = 1;
} finally {
  if (signedIn && page) {
    try {
      await page.getByRole('button', { name: '\u0110\u0103ng xu\u1ea5t', exact: true }).click();
      await page.waitForURL(url => url.pathname === '/admin/dang-nhap', { timeout: 10000 });
    } catch { console.error('Probe session cleanup needs verification; details suppressed.'); process.exitCode = 1; }
  }
  await context?.close();
  await browser?.close();
}
