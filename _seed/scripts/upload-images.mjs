#!/usr/bin/env node
/**
 * upload-images.mjs — Tải ảnh giày từ Unsplash, cắt 3 khung, đẩy lên Supabase Storage,
 * rồi cập nhật cột `images` của bảng veloce_products.
 *
 * Chạy một lần sau khi dựng xong Phase 1:
 *   npm run gen:images
 *
 * ─────────────────────────────────────────────────────────────
 * VÌ SAO CẮT 3 KHUNG THAY VÌ LẤY 3 ẢNH KHÁC NHAU?
 * Kho ảnh stock không có 3 góc chụp của CÙNG một đôi giày. Ghép 3 ảnh khác
 * nhau vào một gallery thì người xem thấy ngay là 3 đôi giày khác nhau.
 * Cắt 3 khung từ một ảnh gốc thì gallery luôn nhất quán.
 *
 * Ba khung sinh ra cho mỗi sản phẩm:
 *   {slug}-1.jpg  Toàn cảnh    — ảnh gốc trên nền gradient neon, có khoảng thở
 *   {slug}-2.jpg  Cận chi tiết — phóng 1.8x vào giữa, thấy rõ chất liệu
 *   {slug}-3.jpg  Góc nghiêng  — xoay nhẹ + backdrop đậm hơn
 * ─────────────────────────────────────────────────────────────
 *
 * CÀI ĐẶT
 *   npm i -D sharp tsx
 *   npm pkg set scripts.gen:images="tsx scripts/upload-images.mjs"
 *
 * BIẾN MÔI TRƯỜNG (.env.local)
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *   VELOCE_ADMIN_EMAIL=...        <- tài khoản admin đã tạo ở PLAN.md mục 4.5
 *   VELOCE_ADMIN_PASSWORD=...
 *
 * Script PHẢI đăng nhập vì RLS chặn ghi Storage và ghi bảng với vai trò anon.
 * Đây là chủ ý — đừng "sửa" bằng cách dùng service_role key.
 *
 * GIẤY PHÉP: ảnh Unsplash được phép dùng thương mại, không cần ghi nguồn.
 * ⚠️ NHÃN HIỆU: một số ảnh sneaker có logo thương hiệu hiện rõ. Giấy phép Unsplash
 * KHÔNG cấp quyền với nhãn hiệu trong ảnh. Trước khi deploy công khai, xem lại
 * bucket và thay ảnh nào lộ logo bằng cách sửa cột unsplash_id rồi chạy lại.
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// ── Đọc .env.local thủ công (script chạy ngoài Next.js) ──────────────
async function loadEnv() {
  try {
    const raw = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* không có .env.local thì dùng biến môi trường sẵn có */
  }
}

const CACHE_DIR = path.join(process.cwd(), ".cache", "unsplash");
const BUCKET = "veloce";
const W = 1000;
const H = 1250; // tỉ lệ 4:5

// Bảng màu mặc định — backdrop phải khớp design system (PLAN.md mục 2.1)
const NEON = [
  { a: "#8b5cf6", b: "#22d3ee" },
  { a: "#d946ef", b: "#8b5cf6" },
  { a: "#22d3ee", b: "#0d0b18" },
  { a: "#8b5cf6", b: "#0d0b18" },
];

/** Chọn cặp màu ổn định theo slug — cùng slug luôn ra cùng màu */
const pickNeon = (slug) => {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return NEON[h % NEON.length];
};

/** Nền gradient + quầng sáng, dùng làm backdrop cho ảnh giày */
const backdrop = (slug, { blobs = true } = {}) => {
  const { a, b } = pickNeon(slug);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a}" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="${b}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#07060d"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="42%" r="55%">
        <stop offset="0%" stop-color="${a}" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="${a}" stop-opacity="0"/>
      </radialGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="60"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="#07060d"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    ${blobs ? `<circle cx="${W * 0.28}" cy="${H * 0.3}" r="${W * 0.34}" fill="url(#glow)" filter="url(#soft)"/>
    <circle cx="${W * 0.76}" cy="${H * 0.68}" r="${W * 0.28}" fill="${b}" opacity="0.28" filter="url(#soft)"/>` : ""}
  </svg>`);
};

/** Lấy URL file ảnh thật trên images.unsplash.com từ mã ảnh ngắn */
async function resolveUnsplash(id) {
  const res = await fetch(`https://unsplash.com/photos/${id}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; veloce-seed/1.0)" },
  });
  if (!res.ok) throw new Error(`Không mở được trang ảnh ${id} (HTTP ${res.status})`);
  const html = await res.text();
  const m = html.match(/https:\/\/images\.unsplash\.com\/photo-[\w-]+/);
  if (!m) throw new Error(`Không tìm thấy link ảnh trong trang ${id}`);
  return `${m[0]}?w=1600&q=85&fm=jpg&fit=max`;
}

/** Tải ảnh gốc, có cache để chạy lại không tải lại */
async function fetchSource(id) {
  await mkdir(CACHE_DIR, { recursive: true });
  const cached = path.join(CACHE_DIR, `${id}.jpg`);
  try {
    await access(cached);
    return cached;
  } catch {}
  const url = await resolveUnsplash(id);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tải ảnh ${id} thất bại (HTTP ${res.status})`);
  await writeFile(cached, Buffer.from(await res.arrayBuffer()));
  return cached;
}

/** Khung 1 — toàn cảnh */
const frameFull = async (src, slug) => {
  const shoe = await sharp(src)
    .resize({ width: Math.round(W * 0.82), height: Math.round(H * 0.62), fit: "inside" })
    .toBuffer();
  return sharp(backdrop(slug))
    .composite([{ input: shoe, gravity: "center" }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
};

/** Khung 2 — cận chi tiết */
const frameDetail = async (src) => {
  const { width = 0, height = 0 } = await sharp(src).metadata();
  const cw = Math.round(width / 1.8);
  const ch = Math.round(cw * (H / W));
  return sharp(src)
    .extract({
      left: Math.max(0, Math.round((width - cw) / 2)),
      top: Math.max(0, Math.round((height - ch) / 2)),
      width: Math.min(cw, width),
      height: Math.min(ch, height),
    })
    .resize(W, H, { fit: "cover" })
    .modulate({ saturation: 1.08 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
};

/** Khung 3 — góc nghiêng */
const frameAngle = async (src, slug) => {
  const shoe = await sharp(src)
    .resize({ width: Math.round(W * 0.9), height: Math.round(H * 0.58), fit: "inside" })
    .rotate(-9, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp(backdrop(slug, { blobs: false }))
    .composite([{ input: shoe, gravity: "center" }])
    .modulate({ brightness: 0.97 })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
};

async function main() {
  await loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.VELOCE_ADMIN_EMAIL;
  const password = process.env.VELOCE_ADMIN_PASSWORD;

  const missing = Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
    VELOCE_ADMIN_EMAIL: email,
    VELOCE_ADMIN_PASSWORD: password,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    console.error(`Thiếu biến môi trường: ${missing.join(", ")}\nXem hướng dẫn ở đầu file này.`);
    process.exit(1);
  }

  const sb = createClient(url, key);
  const { error: authErr } = await sb.auth.signInWithPassword({ email, password });
  if (authErr) {
    console.error(`Đăng nhập thất bại: ${authErr.message}`);
    console.error("Kiểm tra: tài khoản đã tạo chưa (PLAN.md mục 4.5) và đã Auto Confirm chưa?");
    process.exit(1);
  }

  const { data: products, error } = await sb
    .from("veloce_products")
    .select("id, slug, unsplash_id")
    .order("sort_order");
  if (error) {
    console.error(`Không đọc được danh sách sản phẩm: ${error.message}`);
    process.exit(1);
  }

  let ok = 0;
  const failed = [];

  for (const [i, p] of products.entries()) {
    const tag = `[${String(i + 1).padStart(2, "0")}/${products.length}] ${p.slug}`;
    if (!p.unsplash_id) {
      failed.push({ slug: p.slug, reason: "chưa có unsplash_id" });
      console.error(`${tag}  ✗ chưa có unsplash_id`);
      continue;
    }
    try {
      const src = await fetchSource(p.unsplash_id);
      const frames = await Promise.all([
        frameFull(src, p.slug),
        frameDetail(src),
        frameAngle(src, p.slug),
      ]);

      const urls = [];
      for (const [n, buf] of frames.entries()) {
        const objectPath = `products/${p.slug}-${n + 1}.jpg`;
        const { error: upErr } = await sb.storage
          .from(BUCKET)
          .upload(objectPath, buf, { contentType: "image/jpeg", upsert: true });
        if (upErr) throw new Error(`upload ${objectPath}: ${upErr.message}`);
        urls.push(sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl);
      }

      const { error: updErr } = await sb
        .from("veloce_products")
        .update({ images: urls })
        .eq("id", p.id);
      if (updErr) throw new Error(`cập nhật cột images: ${updErr.message}`);

      ok++;
      console.log(`${tag}  ✓ 3 khung`);
    } catch (err) {
      failed.push({ slug: p.slug, id: p.unsplash_id, reason: err.message });
      console.error(`${tag}  ✗ ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 400)); // lịch sự với Unsplash
  }

  console.log(`\nXong: ${ok}/${products.length} sản phẩm có đủ 3 ảnh trên Storage.`);
  if (failed.length) {
    console.log("\nCần xử lý thủ công:");
    for (const f of failed) console.log(`  ${f.slug}${f.id ? ` (${f.id})` : ""} — ${f.reason}`);
    console.log("\nCách sửa: mở unsplash.com, tìm ảnh giày phù hợp, lấy mã ở cuối URL");
    console.log("(unsplash.com/photos/XXXXX) rồi cập nhật cột unsplash_id của sản phẩm đó.");
    process.exitCode = 1;
  }

  await sb.auth.signOut();
}

main();
