#!/usr/bin/env node
/**
 * gen-images.mjs — Tải ảnh giày từ Unsplash và cắt thành 3 khung cho mỗi sản phẩm.
 *
 * Chạy một lần:  npm run gen:images
 *
 * Vì sao phải cắt 3 khung thay vì lấy 3 ảnh khác nhau?
 * Vì kho ảnh stock không có 3 góc chụp của CÙNG một đôi giày. Nếu ghép 3 ảnh
 * khác nhau vào một gallery, người xem thấy ngay là 3 đôi giày khác nhau.
 * Cắt 3 khung từ một ảnh gốc thì gallery luôn nhất quán.
 *
 * Ba khung sinh ra cho mỗi sản phẩm:
 *   {slug}-1.jpg  Toàn cảnh  — ảnh gốc đặt trên nền gradient neon, có khoảng thở
 *   {slug}-2.jpg  Cận chi tiết — phóng 1.8x vào giữa, thấy rõ chất liệu
 *   {slug}-3.jpg  Góc nghiêng — xoay nhẹ + đổ bóng + backdrop tím/cyan
 *
 * Cài đặt:
 *   npm i -D sharp tsx
 *
 * Thêm vào package.json:
 *   "scripts": { "gen:images": "tsx scripts/gen-images.mjs" }
 *
 * Vì sao cần tsx: script này import trực tiếp từ src/data/products.ts.
 * Node thuần không đọc được TypeScript, tsx lo phần đó. (Node >= 22.6 có thể
 * chạy bằng `node --experimental-strip-types` thay cho tsx nếu muốn ít dependency hơn.)
 *
 * GIẤY PHÉP: ảnh Unsplash được phép dùng thương mại, không cần ghi nguồn.
 * LƯU Ý NHÃN HIỆU: một số ảnh sneaker trên Unsplash có logo thương hiệu hiện rõ.
 * Trước khi deploy công khai, hãy xem lại thư mục public/images/products/ và
 * thay những ảnh lộ logo bằng ảnh khác trong POOL bên dưới, hoặc bằng ảnh tự chụp.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { products } from "../src/data/products.ts";

const OUT_DIR = path.join(process.cwd(), "public", "images", "products");
const CACHE_DIR = path.join(process.cwd(), ".cache", "unsplash");
const W = 1000;
const H = 1250; // tỉ lệ 4:5

// Bảng màu neon lấy từ PLAN.md mục 2.1 — backdrop phải khớp design system
const NEON = [
  { a: "#8b5cf6", b: "#22d3ee" }, // violet → cyan
  { a: "#d946ef", b: "#8b5cf6" }, // fuchsia → violet
  { a: "#22d3ee", b: "#0d0b18" }, // cyan → ink
  { a: "#8b5cf6", b: "#0d0b18" }, // violet → ink
];

/** Chọn cặp màu ổn định theo slug — cùng slug luôn ra cùng màu */
const pickNeon = (slug) => {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return NEON[h % NEON.length];
};

/** Nền gradient + hạt sáng, dùng làm backdrop cho ảnh giày */
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

/** Khung 1 — toàn cảnh: giày đặt giữa nền gradient, có khoảng thở */
const frameFull = async (src, slug) => {
  const shoe = await sharp(src)
    .resize({ width: Math.round(W * 0.82), height: Math.round(H * 0.62), fit: "inside" })
    .toBuffer();
  return sharp(backdrop(slug))
    .composite([{ input: shoe, gravity: "center", blend: "over" }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
};

/** Khung 2 — cận chi tiết: phóng 1.8x vào giữa ảnh gốc */
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

/** Khung 3 — góc nghiêng: xoay nhẹ trên backdrop đậm hơn */
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
  await mkdir(OUT_DIR, { recursive: true });
  let ok = 0;
  const failed = [];

  for (const [i, p] of products.entries()) {
    const tag = `[${String(i + 1).padStart(2, "0")}/${products.length}] ${p.slug}`;
    try {
      const src = await fetchSource(p.unsplashId);
      const [f1, f2, f3] = await Promise.all([
        frameFull(src, p.slug),
        frameDetail(src),
        frameAngle(src, p.slug),
      ]);
      await Promise.all([
        writeFile(path.join(OUT_DIR, `${p.slug}-1.jpg`), f1),
        writeFile(path.join(OUT_DIR, `${p.slug}-2.jpg`), f2),
        writeFile(path.join(OUT_DIR, `${p.slug}-3.jpg`), f3),
      ]);
      ok++;
      console.log(`${tag}  ✓ 3 khung`);
    } catch (err) {
      failed.push({ slug: p.slug, id: p.unsplashId, reason: err.message });
      console.error(`${tag}  ✗ ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 400)); // lịch sự với Unsplash
  }

  console.log(`\nXong: ${ok}/${products.length} sản phẩm có đủ 3 ảnh.`);
  if (failed.length) {
    console.log("\nCần xử lý thủ công:");
    for (const f of failed) console.log(`  ${f.slug} (unsplashId: ${f.id}) — ${f.reason}`);
    console.log("\nCách sửa: mở unsplash.com, tìm ảnh giày phù hợp, lấy mã ở cuối URL");
    console.log("(unsplash.com/photos/XXXXX) rồi thay vào unsplashId trong src/data/products.ts.");
    process.exitCode = 1;
  }
}

main();
