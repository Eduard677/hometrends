#!/usr/bin/env node
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://hometrends-deploy.vercel.app";
const retiredSlugs = new Set(["modular-sofa", "corner-sofa"]);
const retiredIds = new Set(["ERR-001", "ERR-002"]);

const shop = JSON.parse(readFileSync(join(root, "src/data/ht-shop.json"), "utf8"));
const collections = [
  "sofas-chairs",
  "chairs-footstools",
  "beds-mattresses",
  "beds",
  "mattresses",
  "bedroom-furniture",
  "dining",
  "living-room",
  "rugs",
  "rugs-modern",
  "rugs-traditional",
  "rugs-shaggy",
  "kids-furniture",
  "lighting",
  "accessories",
  "objects",
  "flooring",
  "garden-furniture",
];
const pages = [
  "/",
  "/shop",
  "/about",
  "/showroom",
  "/contact",
  "/bespoke",
  "/delivery",
  "/returns",
  "/privacy",
  "/terms",
  "/cookies",
];

const seen = new Set();
const paths = [];
function push(path) {
  if (seen.has(path)) return;
  seen.add(path);
  paths.push(path);
}

for (const path of pages) push(path);
for (const slug of collections) push(`/collections/${slug}`);
for (const item of shop) {
  if (retiredSlugs.has(item.slug) || retiredIds.has(item.id)) continue;
  push(`/products/${item.slug}`);
}

/* Crawlability. Every entry now carries <lastmod>. The catalogue is a static
   file, so the honest signal is when its contents last changed on disk rather
   than the time the build happened to run — a build-time stamp would tell
   crawlers the whole site changed on every deploy. */
const lastmod = statSync(join(root, "src/data/ht-shop.json")).mtime.toISOString().slice(0, 10);

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...paths.map((path) => `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`),
  `</urlset>`,
  ``,
].join("\n");

writeFileSync(join(root, "public/sitemap.xml"), xml);
console.log(`wrote public/sitemap.xml (${paths.length} urls)`);
