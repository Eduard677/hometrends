import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Prune only disposable build output. Supplied source files are never deleted.
const output = '.vercel/output/static';
const keep = new Set();
async function walk(dir) {
  return (await Promise.all((await fs.readdir(dir, { withFileTypes: true })).map(f => f.isDirectory() ? walk(path.join(dir, f.name)) : path.join(dir, f.name)))).flat();
}
for (const file of await walk('src')) {
  if (!/\.(tsx?|css)$/.test(file) && !['ht-shop.json', 'site-media.json'].includes(path.basename(file))) continue;
  for (const match of (await fs.readFile(file, 'utf8')).matchAll(/['"(](\/media\/[^'"\s)]+\.(?:webp|jpe?g|png|svg|ico))/g)) keep.add(match[1]);
}
const removed = [], resized = [];
for (const file of await walk(`${output}/media`)) {
  const url = file.slice(output.length);
  if (!keep.has(url)) { await fs.unlink(file); removed.push(url); continue; }
  if (!/\.(webp|jpe?g|png)$/.test(file)) continue;
  const bytes = await fs.readFile(file);
  if (bytes.length < 200000) continue;
  // Header is frozen: optimize its emitted image bytes without altering its markup.
  let optimized;
  const format = /\.webp$/.test(file) ? 'webp' : /\.png$/.test(file) ? 'png' : 'jpeg';
  for (const width of [1400, 1000, 720, 480]) {
    optimized = await sharp(bytes).resize({ width, withoutEnlargement: true }).toFormat(format, { quality: 65, palette: true }).toBuffer();
    if (optimized.length < 200000) break;
  }
  if (optimized.length >= 200000) throw new Error(`Oversized deployed image: ${url}`);
  await fs.writeFile(file, optimized);
  resized.push({ url, before: bytes.length, after: optimized.length });
}
await fs.writeFile('reports/deployment-media.json', JSON.stringify({ removedFromBuildOnly: removed, compressedInBuildOnly: resized }, null, 2) + '\n');
console.log(`Build media: removed ${removed.length} unreferenced assets; compressed ${resized.length} referenced originals. Source assets retained.`);
