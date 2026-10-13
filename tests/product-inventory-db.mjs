// Optional PostgreSQL integration suite, without changing application dependencies.
// node tests/product-inventory-db.mjs <path-to-pglite/dist/index.js>
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const { PGlite } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : "@electric-sql/pglite");
const db = new PGlite();
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema private;
    grant usage on schema private to authenticated;
    create function private.veloce_is_admin() returns boolean language sql as $$ select coalesce(current_setting('test.is_admin', true), '') = 'true' $$;
    create table public.veloce_products (
      id uuid primary key default gen_random_uuid(), name text, slug text, price bigint,
      stock integer, images text[], is_published boolean, sizes integer[], colors jsonb,
      updated_at timestamptz default now()
    );
    create table public.veloce_settings (id integer, coupon_code text, coupon_percent integer, freeship_threshold bigint, shipping_fee bigint);
    create table public.veloce_orders (
      id uuid primary key default gen_random_uuid(), code text unique, customer_name text,
      customer_phone text, customer_email text, address text, note text, items jsonb,
      subtotal bigint, discount bigint, shipping_fee bigint, total bigint,
      status text default 'pending'
    );
    insert into public.veloce_settings values (1, 'DEMO', 10, 1000000, 30000);
    alter table public.veloce_products enable row level security;
    alter table public.veloce_orders enable row level security;
    grant select on public.veloce_products to anon, authenticated;
    grant update on public.veloce_products, public.veloce_orders to authenticated;
    grant select on public.veloce_orders to authenticated;
    create policy products_read on public.veloce_products for select using (true);
    create policy products_update on public.veloce_products for update to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());
    create policy orders_admin on public.veloce_orders to authenticated using (private.veloce_is_admin()) with check (private.veloce_is_admin());
    select set_config('test.is_admin', 'true', false);
  `);
  const migration = await readFile(new URL("../supabase/migrations/20261012134125_veloce_variant_inventory.sql", import.meta.url), "utf8");
  await db.exec(migration);
  await db.exec(migration); // Safe reapplication.
  assert.equal((await db.query("select public.veloce_variant_inventory_ready() as ready")).rows[0].ready, true);
  await db.exec(await readFile(new URL("../supabase/migrations/20261002093951_veloce_checkout_idempotency.sql", import.meta.url), "utf8").then((sql) => sql.split("-- Aggregate revenue")[0]));
  const id = "00000000-0000-4000-8000-000000000001";
  const images = ["https://example.com/black.webp", "https://example.com/white.webp"];
  const colors = [
    { name: "Đen", hex: "#000000", image: images[0], inventory: [{ size: 39, quantity: 2 }, { size: 40, quantity: 0 }] },
    { name: "Trắng", hex: "#ffffff", image: images[1], inventory: [{ size: 39, quantity: 0 }, { size: 40, quantity: 7 }] },
  ];
  await db.query("insert into public.veloce_products(id, name, slug, price, stock, images, is_published, sizes, colors) values ($1,'Giày mẫu','giay-mau',500000,99,$2,true,'{39,40}',$3)", [id, images, JSON.stringify(colors)]);
  const getProduct = async () => (await db.query("select * from public.veloce_products where id = $1", [id])).rows[0];
  const place = async (items) => (await db.query("select * from public.veloce_place_order('Khách hàng','0900000000','Địa chỉ mẫu',$1)", [JSON.stringify(items)])).rows[0];
  const item = (color, size, quantity = 1) => ({ product_id: id, color, size, quantity });
  assert.equal((await getProduct()).stock, 9);
  await db.exec("set role anon");
  const order = await place([item("#FFFFFF", 40, 2), item("#000000", 39)]);
  await db.exec("reset role");
  let product = await getProduct();
  assert.equal(product.stock, 6);
  assert.equal(product.colors[0].inventory[0].quantity, 1);
  assert.equal(product.colors[1].inventory[1].quantity, 5);
  const snapshot = (await db.query("select items from public.veloce_orders where id=$1", [order.order_id])).rows[0].items;
  assert.equal(snapshot[1].image, images[0]);
  assert.equal(snapshot[0].image, images[1]);
  assert.equal(snapshot[0].color, "#ffffff");
  assert.equal(Number(order.order_total), 1500000);
  console.log("PASS: anonymous checkout decrements only selected variants and snapshots their images");
  for (const items of [[item("#000000", 40)], [item("#ffffff", 40, 6)], [item("#ff0000", 39)], [item("#000000", null)], [item("#000000", 39), item("#000000", 39)]]) {
    await assert.rejects(place(items));
    assert.equal((await getProduct()).stock, 6);
  }
  console.log("PASS: sold-out/invalid variants and duplicate cart lines fail atomically");
  const key = "00000000-0000-4000-8000-000000000002";
  const retry = async () => (await db.query("select * from public.veloce_place_order_idempotent($1,'Khách hàng','0900000000','Địa chỉ mẫu',$2)", [key, JSON.stringify([item("#ffffff", 40)])])).rows[0];
  const first = await retry();
  assert.equal((await retry()).order_id, first.order_id);
  assert.equal((await getProduct()).stock, 5);
  console.log("PASS: checkout retry does not subtract stock twice");
  await db.exec("set role authenticated; select set_config('test.is_admin', 'false', false)");
  await assert.rejects(db.query("select public.veloce_cancel_order($1)", [order.order_id]), /quyền quản trị/);
  await db.exec("select set_config('test.is_admin', 'true', false)");
  await db.query("select public.veloce_cancel_order($1)", [order.order_id]);
  await assert.rejects(db.query("select public.veloce_cancel_order($1)", [order.order_id]), /hủy rồi/);
  await db.exec("reset role");
  product = await getProduct();
  assert.equal(product.stock, 8);
  assert.equal(product.colors[0].inventory[0].quantity, 2);
  assert.equal(product.colors[1].inventory[1].quantity, 6);
  console.log("PASS: admin cancellation restores exactly the ordered variants once; non-admin denied");
  for (const invalidColors of [
    [{ ...colors[0], inventory: [{ size: 39, quantity: -1 }, { size: 40, quantity: 0 }] }, colors[1]],
    [{ ...colors[0], inventory: [{ size: 39, quantity: 0.5 }, { size: 40, quantity: 0 }] }, colors[1]],
    [{ ...colors[0], inventory: [{ size: 39, quantity: 1 }, { size: 39, quantity: 1 }] }, colors[1]],
    [colors[0], { name: "Trắng", hex: "#ffffff" }],
    [colors[0], { ...colors[1], hex: "#000000" }],
    [{ ...colors[0], image: "https://example.com/missing.webp" }, colors[1]],
  ]) await assert.rejects(db.query("update public.veloce_products set colors=$1 where id=$2", [JSON.stringify(invalidColors), id]));
  await db.query("update public.veloce_products set stock=999 where id=$1", [id]);
  assert.equal((await getProduct()).stock, 8);
  console.log("PASS: database rejects invalid allocation and recalculates aggregate stock");
  await db.query("update public.veloce_products set colors=$1, sizes='{39}' where id=$2", [JSON.stringify([{ ...colors[0], inventory: [{ size: 39, quantity: 2 }] }]), id]);
  await assert.rejects(db.query("select public.veloce_cancel_order($1)", [first.order_id]), /Khôi phục biến thể/);
  assert.equal((await getProduct()).stock, 2);
  assert.equal((await db.query("select status from public.veloce_orders where id=$1", [first.order_id])).rows[0].status, "pending");
  console.log("PASS: deleted variant blocks cancellation with a recoverable error and no partial writes");
  await db.exec("insert into public.veloce_products(id,name,slug,price,stock,images,is_published,sizes,colors) values ('00000000-0000-4000-8000-000000000003','Giày cũ','giay-cu',500000,10,'{}',true,'{39}','[{\"name\":\"Đen\",\"hex\":\"#000000\"}]')");
  const legacyOrder = await place([{ product_id: "00000000-0000-4000-8000-000000000003", color: "#000000", size: 39, quantity: 2 }]);
  assert.equal((await db.query("select stock from public.veloce_products where slug='giay-cu'")).rows[0].stock, 8);
  await db.query("select public.veloce_cancel_order($1)", [legacyOrder.order_id]);
  assert.equal((await db.query("select stock from public.veloce_products where slug='giay-cu'")).rows[0].stock, 10);
  console.log("PASS: legacy unallocated products retain their existing checkout/cancellation behavior");
} finally {
  await db.close();
}
