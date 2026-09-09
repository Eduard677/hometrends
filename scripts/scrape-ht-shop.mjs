#!/usr/bin/env node
/** Pull the live Shopify catalogue from hometrendsfurniture.ie */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const ROOT = "https://hometrendsfurniture.ie";
const OUT = path.resolve("public/media/shopify");
const DATA = path.resolve("public/data");

async function getJson(url) {
  const { stdout } = await execFileAsync("curl", ["-sL", url], { maxBuffer: 20 * 1024 * 1024 });
  return JSON.parse(stdout);
}

function img(src, width = 1200) {
  if (!src) return "";
  const u = src.replace(/^\/\//, "https://");
  return u.includes("?") ? `${u}&width=${width}` : `${u}?width=${width}`;
}

async function download(url, dest) {
  await execFileAsync("curl", ["-sL", "-o", dest, url]);
}

async function allProducts() {
  const products = [];
  for (let page = 1; page <= 20; page++) {
    const data = await getJson(`${ROOT}/products.json?limit=250&page=${page}`);
    const batch = data.products ?? [];
    if (!batch.length) break;
    products.push(...batch);
    console.log(`page ${page}: ${batch.length} (total ${products.length})`);
    if (batch.length < 250) break;
  }
  return products;
}

function slim(p) {
  const image = p.images?.[0]?.src ? img(p.images[0].src) : "";
  const price = p.variants?.[0]?.price ? Number(p.variants[0].price) : null;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    type: p.product_type,
    vendor: p.vendor,
    tags: p.tags,
    price,
    url: `${ROOT}/products/${p.handle}`,
    image,
    images: (p.images ?? []).slice(0, 4).map((i) => img(i.src)),
  };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(DATA, { recursive: true });
  const raw = await allProducts();
  const catalog = raw.map(slim);
  await writeFile(path.join(DATA, "ht-shop.json"), JSON.stringify({ fetched: new Date().toISOString(), count: catalog.length, products: catalog }, null, 2));
  console.log(`saved ${catalog.length} products → public/data/ht-shop.json`);

  let n = 0;
  for (const p of catalog) {
    if (!p.image) continue;
    const ext = p.image.includes(".png") ? "png" : "jpg";
    const dest = path.join(OUT, `${p.handle}.${ext}`);
    try {
      await download(p.image, dest);
      n += 1;
      if (n % 50 === 0) console.log(`images ${n}/${catalog.length}`);
    } catch (err) {
      console.warn("fail", p.handle, err.message);
    }
  }
  console.log(`downloaded ${n} images → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
