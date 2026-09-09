#!/usr/bin/env node
/**
 * Products whose names are supplier SKUs rather than anything a customer
 * would recognise. Names are NOT generated here: inventing product names is
 * worse than leaving them blank. This writes a CSV for the owners to fill in.
 *
 *   node scripts/rename-report.mjs [out.csv]
 */
import { readFileSync, writeFileSync } from "node:fs";

const products = JSON.parse(readFileSync("src/data/ht-shop.json", "utf8"));
const SKU = /^[A-Z]{1,4}-?\d|^FAM-|\d+\s*X\s*\d+\s*CM/i;

const rows = products
  .filter((p) => SKU.test(p.name))
  .map((p) => ({
    slug: p.slug,
    current_name: p.name,
    proposed_name: "",
    collection: (p.tags ?? []).join(" "),
    size_in_name: (p.name.match(/(\d+)\s*X\s*(\d+)\s*CM/i) ?? [])[0] ?? "",
    price: p.fromPrice ?? "",
    image: p.image ?? "",
  }));

const cols = ["slug", "current_name", "proposed_name", "collection", "size_in_name", "price", "image"];
const esc = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";

const out = process.argv[2] ?? "reports/products-to-rename.csv";
writeFileSync(out, csv);
console.log(`${rows.length} SKU-named products -> ${out}`);
console.log("proposed_name is intentionally blank for the owners to fill in.");
