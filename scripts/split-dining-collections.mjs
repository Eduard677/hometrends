/**
 * Split the single 85-product `dining` collection into the three groupings the
 * showroom actually sells: tables, chairs & benches, and sets.
 *
 * BRIEF.md 1.2 asks the DINING menu column to list these three "categories that
 * genuinely exist". They exist as merchandise but not as collections in this
 * repo, and the brief forbids inventing a category to fill a column out. So they
 * are derived from product names here rather than hand-written into the menu,
 * and every product keeps its `dining` tag so the parent collection is unchanged.
 *
 * Order matters: "Chelsea Dining Set with Bench" is a set, not a bench.
 * Anything matching none of the three (sideboards) stays in `dining` alone.
 *
 * Run: node scripts/split-dining-collections.mjs
 */
import fs from "node:fs/promises";

const FILE = "src/data/ht-shop.json";
const PARENT = "dining";

const RULES = [
  { tag: "dining-sets", test: (name) => /\bset\b|table and \d| \+ \d/.test(name) },
  { tag: "dining-chairs-benches", test: (name) => /\bchair|\bbench|\bstool/.test(name) },
  { tag: "dining-tables", test: (name) => /\btable\b/.test(name) },
];
const ALL_TAGS = RULES.map((rule) => rule.tag);

const shop = JSON.parse(await fs.readFile(FILE, "utf8"));
const counts = Object.fromEntries([...ALL_TAGS, "unclassified"].map((tag) => [tag, 0]));

for (const product of shop) {
  // Re-runnable: clear any previous assignment before deciding again.
  product.tags = product.tags.filter((tag) => !ALL_TAGS.includes(tag));
  if (!product.tags.includes(PARENT)) continue;
  const name = product.name.toLowerCase();
  const rule = RULES.find((candidate) => candidate.test(name));
  if (!rule) {
    counts.unclassified += 1;
    continue;
  }
  product.tags.push(rule.tag);
  counts[rule.tag] += 1;
}

await fs.writeFile(FILE, `${JSON.stringify(shop, null, 2)}\n`);
console.log(Object.entries(counts).map(([tag, n]) => `${tag}: ${n}`).join("\n"));
