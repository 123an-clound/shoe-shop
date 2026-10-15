import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
try {
  const fixture = await readFile(new URL('./order-operations-db.mjs', import.meta.url), 'utf8');
  await db.exec(fixture.slice(fixture.indexOf('await db.exec(`') + 15, fixture.indexOf('`);')));
  await db.exec("grant usage on schema auth to anon; create table auth.users(id uuid primary key); select set_config('test.is_admin','false',false); create table public.veloce_contact_messages(email text); create table public.veloce_newsletter_subscribers(email text);");
  for (const name of ['20261012134125_veloce_variant_inventory.sql','20261002093951_veloce_checkout_idempotency.sql','20261013073147_veloce_order_operations.sql','20261013082046_veloce_order_event_timestamps.sql','20261013090202_veloce_customer_accounts.sql','20261015033947_veloce_abuse_protection.sql']) {
    await db.exec(await readFile(new URL('../supabase/migrations/' + name, import.meta.url), 'utf8'));
  }
  const product='00000000-0000-4000-8000-000000000001';
  await db.query("insert into public.veloce_products(id,name,slug,price,stock,images,is_published,sizes,colors) values($1,'Test','test',500000,100,'{}',true,'{39}',$2)", [product,JSON.stringify([{name:'Đen',hex:'#000000',inventory:[{size:39,quantity:100}]}])]);
  const items=JSON.stringify([{product_id:product,color:'#000000',size:39,quantity:1}]);
  await db.exec('set role anon');
  const base=()=>db.query("select * from public.veloce_place_order('Test','0900000000','Test address',$1)",[items]);
  const receipt=(key)=>db.query("select * from public.veloce_place_order_with_receipt($1,$2,'Test','0900000000','Test address',$3)",[key,'a'.repeat(64),items]);
  const key='00000000-0000-4000-8000-000000000021';
  const first=await receipt(key);
  for(let i=0;i<8;i++) assert.equal((await receipt(key)).rows[0].order_id,first.rows[0].order_id);
  for(let i=0;i<4;i++) await base();
  await assert.rejects(base(),/Quá nhiều/);
  await assert.rejects(receipt('00000000-0000-4000-8000-000000000022'),/Quá nhiều/);
  await assert.rejects(db.query("select * from public.veloce_place_order_idempotent(gen_random_uuid(),'Test','+84900000000','Test address',$1)",[items]),/Quá nhiều/);
  await assert.rejects(db.query('select * from private.veloce_request_limits'),/permission denied/);
  await db.exec('reset role');
  assert.equal((await db.query('select stock from public.veloce_products where id=$1',[product])).rows[0].stock,95);
  assert.equal((await db.query("select count(*)::int as n from public.veloce_orders where code <> 'OLD'")).rows[0].n,5);
  await db.exec("update private.veloce_request_limits set expires_at=now()-interval '1 second' where scope='order-phone-short'; set role anon;");
  await base();
  for(let i=0;i<3;i++) await db.query("select public.veloce_check_auth_rate('otp-send','customer@example.com')");
  await assert.rejects(db.query("select public.veloce_check_auth_rate('otp-send','customer@example.com')"),/Quá nhiều/);
  await assert.rejects(db.query("select public.veloce_check_auth_rate('arbitrary','customer@example.com')"),/không hợp lệ/);
  await db.exec('reset role');
  // A rotated email cannot bypass the per-shop ceiling.
  for(let i=0;i<60;i++) await db.query('insert into public.veloce_newsletter_subscribers values($1)',[`customer${i}@example.com`]);
  await assert.rejects(db.query("insert into public.veloce_newsletter_subscribers values('another@example.com')"),/Quá nhiều/);
  console.log('PASS: direct RPCs, retries, rollback, canonical phone, expiry, private ACL and rotating-email limit');
} finally { await db.close(); }
