/**
 * Backfill src/data/ht-shop.json from catalogue/catalogue.json.
 *
 * The two files are the same 7 Sep 2026 scrape of hometrendsfurniture.ie cleaned
 * two different ways: ht-shop.json carries the site's presentation fields
 * (slug, imageAlt, collections, related, editorial copy), catalogue.json carries
 * the merchandising truth (variant options, stock, CTA rule, exact prices).
 *
 * This merges the second into the first by Shopify product id, so the site keeps
 * its own shape. It does not invent products: ids present in one file and not the
 * other are reported and left alone.
 *
 * Money becomes integer cents. ht-shop.json previously stored whole euros, which
 * silently truncated the 21 price values that carry real cents (29.99, 274.99,
 * 639.99 and so on). Field names are unchanged — only the unit moves — so the
 * single formatting change lives in euro() rather than at every call site.
 *
 * Run: node scripts/backfill-catalogue.mjs
 */
import fs from "node:fs/promises";

const SHOP_FILE = "src/data/ht-shop.json";
const CATALOGUE_FILE = "catalogue/catalogue.json";

const shop = JSON.parse(await fs.readFile(SHOP_FILE, "utf8"));
const catalogue = JSON.parse(await fs.readFile(CATALOGUE_FILE, "utf8"));
const byId = new Map(catalogue.map((p) => [String(p.id), p]));

/** True once the file has already been converted, so re-runs stay idempotent. */
const alreadyCents = shop.some((p) => p.priceUnit === "cents");

const report = {
  matched: 0,
  missingFromCatalogue: [],
  unusedCatalogueIds: new Set(byId.keys()),
  ctaAdd: 0,
  ctaOptions: 0,
  outOfStock: 0,
  hasRange: 0,
  optionNames: new Map(),
  clearedMarkdowns: 0,
};

for (const product of shop) {
  const source = byId.get(String(product.id));
  if (!source) {
    report.missingFromCatalogue.push(product.slug);
    continue;
  }
  report.matched += 1;
  report.unusedCatalogueIds.delete(String(product.id));

  // --- money -------------------------------------------------------------
  // Prices come from the catalogue in cents and replace the truncated euro
  // figures outright rather than being multiplied up from them.
  product.fromPrice = source.priceMin;
  product.priceMax = source.priceMax;
  product.priceUnit = "cents";

  // --- CTA and price display, independent of one another -----------------
  // 147 products have several variants at one price: flat price, "Choose options".
  product.cta = source.cta;
  product.priceVaries = source.hasRange;
  if (source.cta === "add") report.ctaAdd += 1;
  else report.ctaOptions += 1;
  if (source.hasRange) report.hasRange += 1;

  // --- stock -------------------------------------------------------------
  product.inStock = source.inStock;
  if (!source.inStock) report.outOfStock += 1;

  // --- options, generically ----------------------------------------------
  // Shopify's default "Title" option is already stripped upstream, so an empty
  // array means a single variant. Names beyond Size/Colour are common.
  product.options = source.options ?? [];
  for (const option of product.options) {
    report.optionNames.set(option.name, (report.optionNames.get(option.name) ?? 0) + 1);
  }

  // --- variants ----------------------------------------------------------
  // Keyed by variant id so the site's own per-variant fields survive a re-run.
  const existing = new Map((product.variants ?? []).map((v) => [String(v.id), v]));
  product.variants = source.variants.map((variant) => {
    const prior = existing.get(String(variant.id)) ?? {};
    const merged = {
      ...prior,
      id: String(variant.id),
      title: variant.label,
      label: variant.label,
      price: variant.price,
      available: variant.available,
      options: variant.label ? variant.label.split(" / ") : [],
    };
    // `was` is null wherever the markdown was invalid (was <= price); those were
    // dropped upstream. Render the price alone in that case.
    if (variant.was == null) {
      if (prior.compareAt != null) report.clearedMarkdowns += 1;
      delete merged.compareAt;
    } else {
      merged.compareAt = variant.was;
    }
    return merged;
  });

  // Product-level compareAt tracks the variant the product-level price is from.
  const leadVariant = product.variants.find((v) => v.price === source.priceMin) ?? product.variants[0];
  if (leadVariant?.compareAt != null) product.compareAt = leadVariant.compareAt;
  else delete product.compareAt;
}

await fs.writeFile(SHOP_FILE, `${JSON.stringify(shop, null, 2)}\n`);

const optionNames = [...report.optionNames.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => `${name} (${count})`)
  .join(", ");

console.log([
  `already in cents before this run: ${alreadyCents}`,
  `matched: ${report.matched} of ${shop.length}`,
  `in ht-shop but not catalogue: ${report.missingFromCatalogue.length}${report.missingFromCatalogue.length ? ` (${report.missingFromCatalogue.join(", ")})` : ""}`,
  `in catalogue but not ht-shop: ${report.unusedCatalogueIds.size}`,
  `cta "add": ${report.ctaAdd}   cta "options": ${report.ctaOptions}`,
  `shows a price range: ${report.hasRange}`,
  `out of stock entirely: ${report.outOfStock}`,
  `invalid markdowns cleared: ${report.clearedMarkdowns}`,
  `option names: ${optionNames}`,
].join("\n"));
