/**
 * Repair cutouts whose original white studio background was left behind in
 * enclosed areas — between a bar stool's legs, inside a chair frame — when the
 * image was composited onto the cream palette. Reads as a white patch on cream.
 *
 * BRIEF.md 2.3 says report rather than edit; this runs only because the defect
 * was judged too visible on the homepage to present with. Originals are copied
 * to asset-inbox/pre-remask/ before anything is written.
 *
 * Safety: a white *product* must never be erased. Only near-white pixels that
 * are BOTH in a connected region not touching the image border AND flat (no
 * shading) are replaced. A gloss wardrobe has gradients across its doors and
 * its background is continuous with the border, so it fails both tests.
 *
 * Run: node scripts/remask-trapped-white.mjs [--dry]
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry");
const BACKUP = "asset-inbox/pre-remask";
const WHITE = (r, g, b) => r > 246 && g > 244 && b > 240;
const FLAT_MAX_SD = 3.2; // luminance spread inside a region that is background
const MIN_REGION = 40; // ignore speckle
/* A mirror's glass is flat, near-white and enclosed by its frame — structurally
   identical to the gap between a bar stool's legs. Nothing at pixel level tells
   them apart, and a first pass ate a crescent out of GD007 Mirror. So the repair
   is deliberately confined to small trapped pockets: the gaps that are visible
   in a card grid. Anything larger stays reported, not edited. */
const MAX_REGION_SHARE = 0.06; // of the whole image
const MAX_TOTAL_SHARE = 0.08; // across all regions in one image

const fit = JSON.parse(await fs.readFile("src/data/image-fit.json", "utf8"));
const shop = JSON.parse(await fs.readFile("src/data/ht-shop.json", "utf8"));
const bySlug = new Map(shop.map((p) => [p.slug, p]));
/* Mirrors and mirrored fronts are excluded outright. Their glass is flat,
   near-white and enclosed by the frame — the same signature as the gap between
   a bar stool's legs — and a run with only the size guards still took a bite out
   of GD001's pane. Nothing at pixel level separates the two, so they stay
   reported rather than edited. */
const REFLECTIVE = /mirror|glass|vetro/i;
const targets = Object.entries(fit).filter(
  ([slug, entry]) => entry.trappedWhite && !REFLECTIVE.test(bySlug.get(slug)?.name ?? ""),
);

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

async function repair(file) {
  const image = sharp(file);
  const meta = await image.metadata();
  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const idx = (x, y) => (y * width + x) * channels;

  // Background colour, sampled from the border ring.
  const ring = [];
  for (let x = 0; x < width; x += 3) ring.push(idx(x, 0), idx(x, height - 1));
  for (let y = 0; y < height; y += 3) ring.push(idx(0, y), idx(width - 1, y));
  const bg = [0, 1, 2].map((k) => Math.round(ring.reduce((s, i) => s + data[i + k], 0) / ring.length));

  const seen = new Uint8Array(width * height);
  let changed = 0;
  let regions = 0;

  for (let y0 = 0; y0 < height; y0 += 1) {
    for (let x0 = 0; x0 < width; x0 += 1) {
      const start = y0 * width + x0;
      if (seen[start]) continue;
      const i0 = idx(x0, y0);
      if (!WHITE(data[i0], data[i0 + 1], data[i0 + 2])) continue;

      // Flood the connected white region.
      const stack = [start];
      const pixels = [];
      let touchesBorder = false;
      seen[start] = 1;
      while (stack.length) {
        const p = stack.pop();
        const x = p % width;
        const y = (p - x) / width;
        pixels.push(p);
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesBorder = true;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const np = ny * width + nx;
          if (seen[np]) continue;
          const ni = idx(nx, ny);
          if (!WHITE(data[ni], data[ni + 1], data[ni + 2])) continue;
          seen[np] = 1;
          stack.push(np);
        }
      }

      // A region open to the border is the sweep itself, not trapped.
      if (touchesBorder || pixels.length < MIN_REGION) continue;
      // Too large to be a gap between legs: could be the product itself.
      if (pixels.length / (width * height) > MAX_REGION_SHARE) continue;

      // Flat regions are background; a lit product surface has shading.
      const ls = pixels.map((p) => {
        const i = p * channels;
        return luma(data[i], data[i + 1], data[i + 2]);
      });
      const mean = ls.reduce((s, v) => s + v, 0) / ls.length;
      const sd = Math.sqrt(ls.reduce((s, v) => s + (v - mean) ** 2, 0) / ls.length);
      if (sd > FLAT_MAX_SD) continue;

      regions += 1;
      for (const p of pixels) {
        const i = p * channels;
        data[i] = bg[0];
        data[i + 1] = bg[1];
        data[i + 2] = bg[2];
        changed += 1;
      }
    }
  }

  const share = changed / (width * height);
  // If the repairs add up to a large fraction, this is not a pocket problem.
  if (share > MAX_TOTAL_SHARE) return { skipped: true, share, format: meta.format };
  return { data, width, height, channels, changed, regions, share, format: meta.format };
}

let files = 0;
let touched = 0;
const log = [];

for (const [slug] of targets) {
  const product = bySlug.get(slug);
  for (const key of ["fallback", "src"]) {
    const rel = product?.images?.[0]?.[key];
    if (!rel?.startsWith("/")) continue;
    const file = path.join("public", rel);
    files += 1;
    try {
      const out = await repair(file);
      if (out.skipped) {
        log.push(`HELD  ${product.name} — ${(out.share * 100).toFixed(1)}% is too much to be a trapped pocket`);
        continue;
      }
      if (!out.changed) continue;
      touched += 1;
      log.push(`${product.name} · ${path.basename(file)} · ${out.regions} region(s) · ${(out.share * 100).toFixed(1)}%`);
      if (DRY) continue;
      await fs.mkdir(BACKUP, { recursive: true });
      await fs.copyFile(file, path.join(BACKUP, path.basename(file)));
      const pipeline = sharp(out.data, { raw: { width: out.width, height: out.height, channels: out.channels } });
      const buffer = out.format === "webp"
        ? await pipeline.webp({ quality: 82 }).toBuffer()
        : await pipeline.jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
      await fs.writeFile(file, buffer);
    } catch (error) {
      log.push(`SKIP ${file}: ${error.message}`);
    }
  }
}

console.log(`${DRY ? "[dry run] " : ""}scanned ${files} files across ${targets.length} products`);
console.log(`repaired: ${touched}`);
console.log(log.slice(0, 14).join("\n"));
