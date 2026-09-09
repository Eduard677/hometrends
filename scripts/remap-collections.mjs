#!/usr/bin/env node
/**
 * Re-map collection assignments in src/data/ht-shop.json.
 *
 * The Shopify export used `living-room` as a catch-all: 154 items, of which
 * 45 are not living-room furniture. This moves the ones with an unambiguous
 * destination and reports the rest rather than guessing.
 *
 * Dry run by default. Pass --apply to write.
 */
import { readFileSync, writeFileSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const FILE = "src/data/ht-shop.json";

/** Only moves where the destination is unambiguous from the product name. */
const MOVES = [
  {
    label: "bed / bedframe / wall bed",
    test: (n) => /\bbed\b|bedframe|wall bed|divan|headboard/i.test(n) && !/sofa ?bed/i.test(n),
    drop: ["living-room"],
    add: ["beds", "beds-mattresses", "bedroom"],
  },
  {
    label: "wardrobe / robe / sliderobe",
    test: (n) => /wardrobe|warerobe|robe\b|sliderobe/i.test(n),
    drop: ["living-room"],
    add: ["bedroom-furniture", "bedroom"],
  },
  {
    // Confirmed by the owner: the SKU-named GI items sized in cm are rugs.
    // Re-mapped but deliberately NOT renamed - see scripts/rename-report.mjs.
    label: "SKU-named rug (owner-confirmed)",
    test: (n) => /^[A-Z]{1,4}-?\d|^FAM-|\d+\s*X\s*\d+\s*CM/i.test(n),
    drop: ["living-room"],
    add: ["rugs"],
  },
  {
    label: "desk",
    test: (n) => /\bdesk\b/i.test(n),
    drop: ["living-room"],
    add: ["home-office"],
  },
  {
    label: "office chair",
    test: (n) => /office chair/i.test(n),
    drop: ["living-room", "sofas-chairs", "chairs-footstools"],
    add: ["home-office"],
  },
  {
    // Not furniture. Out of the furniture collection, still sold, still
    // reachable at its own URL.
    label: "gift voucher (out of living-room, no collection)",
    test: (n) => /voucher|gift card/i.test(n),
    drop: ["living-room"],
    add: [],
  },
];

/** No destination exists or the item cannot be identified without inventing
 *  facts about it. Reported for a human decision, never auto-moved. */
const HOLD = [];

const products = JSON.parse(readFileSync(FILE, "utf8"));
const moved = new Map(MOVES.map((m) => [m.label, []]));
const held = new Map(HOLD.map((h) => [h.label, []]));
const claimed = new Set();

for (const p of products) {
  if (!(p.tags ?? []).includes("living-room")) continue;
  const hold = HOLD.find((h) => h.test(p.name));
  if (hold) { held.get(hold.label).push(p.name); claimed.add(p.slug); continue; }
  const move = MOVES.find((m) => m.test(p.name));
  if (!move) continue;
  claimed.add(p.slug);
  moved.get(move.label).push(p.name);
  const next = new Set(p.tags.filter((t) => !move.drop.includes(t)));
  for (const t of move.add) next.add(t);
  p.tags = [...next];
}

const line = (n, s) => `  ${String(n).padStart(3)}  ${s}`;
console.log(`\n${APPLY ? "APPLIED" : "DRY RUN"} — living-room re-map\n`);
console.log("MOVED:");
for (const [k, v] of moved) console.log(line(v.length, k));
console.log("\nHELD for your decision (untouched):");
for (const [k, v] of held) console.log(line(v.length, k));
const remaining = products.filter((p) => (p.tags ?? []).includes("living-room")).length;
console.log(`\nliving-room: 154 → ${remaining}` + (APPLY ? "" : " (if applied)"));

if (APPLY) {
  writeFileSync(FILE, JSON.stringify(products, null, 2) + "\n");
  console.log(`\nwrote ${FILE}`);
} else {
  console.log("\nnothing written. re-run with --apply to write.");
}
