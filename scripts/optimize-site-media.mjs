import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Only local photographs already supplied in public/media; no network access.
async function walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(files.map(f => f.isDirectory() ? walk(path.join(dir, f.name)) : path.join(dir, f.name)))).flat();
}
const sources = new Set();
for (const file of await walk('src')) {
  if (!/\.(tsx?|css)$/.test(file)) continue;
  const text = await fs.readFile(file, 'utf8');
  for (const match of text.matchAll(/['"(](\/media\/[^'"\s)]+\.(?:webp|jpe?g|png))/g)) {
    if (!match[1].startsWith('/media/catalogue/')) sources.add(match[1]);
  }
}
await fs.mkdir('public/media/optimized', { recursive: true });
const manifest = {}, report = [];
for (const source of [...sources].sort()) {
  let input;
  try { input = await fs.readFile(`public${source}`); } catch { report.push({ source, status: 'missing' }); continue; }
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 16);
  const base = `/media/optimized/${hash}`;
  const outputs = {};
  for (const format of ['webp', 'jpeg']) {
    let buffer;
    for (const width of [1600, 1200, 960, 720]) {
      for (const quality of [82, 72, 60, 48, 36]) {
        buffer = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).flatten({ background: '#EFEAE1' }).toFormat(format, { quality }).toBuffer();
        if (buffer.length < 200000) break;
      }
      if (buffer.length < 200000) break;
    }
    if (buffer.length >= 200000) throw new Error(`Image exceeds budget: ${source}`);
    const target = `${base}.${format === 'jpeg' ? 'jpg' : 'webp'}`;
    await fs.writeFile(`public${target}`, buffer);
    outputs[format] = { path: target, bytes: buffer.length };
  }
  const blur = await sharp(input).rotate().resize({ width: 16 }).jpeg({ quality: 30 }).toBuffer();
  manifest[source] = { src: outputs.webp.path, fallback: outputs.jpeg.path, blur: `data:image/jpeg;base64,${blur.toString('base64')}` };
  report.push({ source, originalBytes: input.length, webpBytes: outputs.webp.bytes, jpegBytes: outputs.jpeg.bytes, status: 'optimized' });
}
await fs.writeFile('src/data/site-media.json', JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile('reports/site-image-optimization.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Optimized ${Object.keys(manifest).length} supplied images; ${report.filter(r => r.status === 'missing').length} missing references.`);
// Use the client-supplied share card, not a generated or downloaded photograph.
await fs.copyFile('public/media/brand/og-default.jpg', 'public/og.jpg');
