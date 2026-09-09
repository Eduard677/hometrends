import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const products = JSON.parse(await fs.readFile('src/data/ht-shop.json', 'utf8'));
const media = JSON.parse(await fs.readFile('src/data/site-media.json', 'utf8'));
assert.equal(products.length, 742);
assert.equal(new Set(products.map(p => p.slug)).size, 742);
assert(products.every(p => p.description && !p.slug.includes('-copy')));
const sizes = [];
for (const image of [...products.flatMap(p => p.images), ...Object.values(media)]) {
  for (const url of [image.src, image.fallback].filter(Boolean)) {
    const bytes = (await fs.stat(`public${url}`)).size;
    assert(bytes < 200000, `${url} exceeds 200KB`);
    sizes.push(bytes);
  }
}
const base = process.argv[2] || 'http://127.0.0.1:8081';
const redirects = [
  ['/come-in', '/showroom'], ['/find', '/showroom'], ['/find?q=troy', '/shop?q=troy'],
  ['/products/kingsley-recliner-sofa-range', '/products/kerry-recliner-sofa-range'],
  ['/products/waterford-bedframe-copy', '/products/antrim-bedframe'],
  ['/products/washington-fabric-recliner-sofa', '/products/waterloo-fabric-recliner-sofa'],
];
for (const [from, to] of redirects) {
  const response = await fetch(base + from, { redirect: 'manual' });
  assert.equal(response.status, 301, from);
  assert.equal(response.headers.get('location'), to, from);
}
const report = { products: products.length, galleryEntries: products.reduce((n,p) => n + p.images.length, 0), largestOptimizedImageBytes: Math.max(...sizes), redirectsVerified: redirects, replacementPhotosNeeded: products.filter(p => !p.images.length).map(({ id, name, slug }) => ({ id, name, slug })) };
await fs.writeFile('reports/final-catalogue-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
