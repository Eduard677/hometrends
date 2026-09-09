/**
 * BRIEF.md 2.2. Product imagery mixes two kinds of asset: lifestyle photographs
 * that should fill the frame, and cutouts on a white sweep that should not be
 * cropped into. One `object-fit` cannot serve both, so each product's card image
 * is classified here and the result is committed as src/data/image-fit.json.
 * The site reads that file; this script never runs at build time.
 *
 * It also answers the question the brief asks about the limit of `contain`:
 * `contain` preserves whatever empty margin is baked into the source file, so
 * each cutout's object bounding box is measured as a fraction of image area and
 * anything under 70% is reported as needing a re-export.
 *
 * Run: node scripts/classify-product-media.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SAMPLE = 96; // enough to find an object edge, cheap enough for 742 images
const BG_MIN_LUMA = 214; // the sweep is cream (238,234,225), not white - a prior
                         // pass re-exported the Shopify cutouts onto the palette
const BG_UNIFORM = 14; // max spread across the sampled border for it to be a sweep
/* Low, because a white-gloss wardrobe on a cream sweep is genuinely low
   contrast: at 18 the object all but vanished and every pale piece measured
   as under-filling. Stray pixels are handled by the percentile box below. */
const OBJECT_DELTA = 6;
const TRIM = 0.01; // percentile trimmed off each edge of the bounding box
const REPORT_BELOW = 0.7;

const shop = JSON.parse(await fs.readFile("src/data/ht-shop.json", "utf8"));

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

async function classify(file) {
  const { data, info } = await sharp(file)
    .resize(SAMPLE, SAMPLE, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const at = (x, y) => {
    const i = (y * width + x) * channels;
    return luma(data[i], data[i + 1], data[i + 2]);
  };

  // Sample the border ring: a cutout sits on a uniform light sweep.
  const rgbAt = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const border = [];
  for (let x = 0; x < width; x += 2) border.push(rgbAt(x, 0), rgbAt(x, height - 1));
  for (let y = 0; y < height; y += 2) border.push(rgbAt(0, y), rgbAt(width - 1, y));
  const bg = [0, 1, 2].map((k) => border.reduce((sum, pixel) => sum + pixel[k], 0) / border.length);
  const lumas = border.map((pixel) => luma(pixel[0], pixel[1], pixel[2]));
  const spread = Math.max(...lumas) - Math.min(...lumas);
  if (luma(bg[0], bg[1], bg[2]) < BG_MIN_LUMA || spread > BG_UNIFORM) return { fit: "cover" };

  // Cutout: measure the object's bounding box against that background. Distance
  // is per-channel Euclidean so a tinted object on a cream sweep still reads.
  const xs = [];
  const ys = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = rgbAt(x, y);
      if (Math.hypot(r - bg[0], g - bg[1], b - bg[2]) <= OBJECT_DELTA) continue;
      xs.push(x);
      ys.push(y);
    }
  }
  if (!xs.length) return { fit: "contain", fill: 0 };

  /* BRIEF.md 2.3. Some cutouts were composited onto the cream sweep without the
     original white studio background being removed from enclosed areas - between
     a stool's legs, say. Those pockets read as near-white against a cream ground.
     Counted here so the report names every asset with the defect, not just the
     one the brief spotted. */
  let trapped = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = rgbAt(x, y);
      if (r > 248 && g > 246 && b > 242) trapped += 1;
    }
  }
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  const lo = (list) => list[Math.floor(list.length * TRIM)];
  const hi = (list) => list[Math.min(list.length - 1, Math.ceil(list.length * (1 - TRIM)))];
  const fill = ((hi(xs) - lo(xs) + 1) * (hi(ys) - lo(ys) + 1)) / (width * height);
  const white = trapped / (width * height);
  return {
    fit: "contain",
    fill: Number(fill.toFixed(3)),
    ...(white > 0.005 ? { trappedWhite: Number(white.toFixed(3)) } : {}),
  };
}

const map = {};
const thin = [];
const trappedWhite = [];
let missing = 0;

for (const product of shop) {
  const src = product.images?.[0]?.fallback ?? product.images?.[0]?.src;
  if (!src?.startsWith("/")) {
    missing += 1;
    continue;
  }
  const file = path.join("public", src);
  try {
    const result = await classify(file);
    map[product.slug] = result;
    if (result.fit === "contain" && result.fill < REPORT_BELOW) {
      thin.push({ name: product.name, slug: product.slug, fill: result.fill });
    }
    if (result.trappedWhite) {
      trappedWhite.push({ name: product.name, slug: product.slug, share: result.trappedWhite });
    }
  } catch {
    missing += 1;
  }
}

await fs.writeFile("src/data/image-fit.json", `${JSON.stringify(map, null, 2)}\n`);

const cutouts = Object.values(map).filter((entry) => entry.fit === "contain").length;
thin.sort((a, b) => a.fill - b.fill);
await fs.writeFile(
  "reports/cutout-frame-fill.md",
  [
    "# Cutouts that under-fill their frame",
    "",
    "BRIEF.md 2.2. `object-fit: contain` preserves the empty margin baked into the",
    "source file, so these need re-exporting rather than a CSS change. Fill is the",
    "object's bounding box as a fraction of image area.",
    "",
    `Measured ${Object.keys(map).length} card images: ${cutouts} cutouts, ${Object.keys(map).length - cutouts} lifestyle.`,
    `${thin.length} cutouts fill under ${REPORT_BELOW * 100}% of their frame.`,
    "",
    "| Product | Fill |",
    "| --- | --- |",
    ...thin.map((row) => `| ${row.name} | ${Math.round(row.fill * 100)}% |`),
    "",
    "## Trapped white background (2.3)",
    "",
    "Composited onto the cream sweep without the original white studio background",
    "being removed from enclosed areas - between a stool's legs, say. Reads as a",
    "white patch against cream. An asset defect: the image needs remasking, not CSS.",
    "",
    `${trappedWhite.length} cutouts affected.`,
    "",
    "| Product | Near-white area |",
    "| --- | --- |",
    ...trappedWhite
      .sort((a, b) => b.share - a.share)
      .map((row) => `| ${row.name} | ${(row.share * 100).toFixed(1)}% |`),
    "",
  ].join("\n"),
);

console.log(`classified ${Object.keys(map).length} images (${cutouts} cutouts, ${Object.keys(map).length - cutouts} lifestyle)`);
console.log(`unreadable or remote: ${missing}`);
console.log(`under ${REPORT_BELOW * 100}% frame fill: ${thin.length}`);
console.log(thin.slice(0, 5).map((row) => `  ${row.name} — ${Math.round(row.fill * 100)}%`).join("\n"));
console.log(`trapped white background: ${trappedWhite.length}`);
console.log(trappedWhite.sort((a, b) => b.share - a.share).slice(0, 5).map((row) => `  ${row.name} — ${(row.share * 100).toFixed(1)}%`).join("\n"));
