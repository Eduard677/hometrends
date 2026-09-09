import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const shop = JSON.parse(readFileSync(join(root, "src/data/ht-shop.json"), "utf8"));
const sitemap = readFileSync(join(root, "public/sitemap.xml"), "utf8");
const selector = readFileSync(join(root, "src/components/interactive-selector.tsx"), "utf8");
const store = readFileSync(join(root, "src/lib/store.ts"), "utf8");

const INTERNAL_NAME_SUFFIXES = new Set(["GI", "GIE", "GA", "HJ", "IM", "JB"]);

function customerFacingName(name) {
  const trimmed = name.trim();
  const dashed = trimmed.match(/^(.*?)\s+-\s+([A-Z]{2,4})$/);
  const glued = trimmed.match(/^(.*?)-([A-Z]{2,4})$/);
  const spaced = trimmed.match(/^(.*?)\s+([A-Z]{2,4})$/);
  const match = dashed ?? glued ?? spaced;
  if (!match) return trimmed;
  if (!INTERNAL_NAME_SUFFIXES.has(match[2])) return trimmed;
  return match[1].replace(/[-\s]+$/, "").trim() || trimmed;
}

describe("catalogue repair", () => {
  it("has no fictitious Errigel purchasable SKUs", () => {
    const banned = shop.filter(
      (item) =>
        item.slug === "modular-sofa" ||
        item.slug === "corner-sofa" ||
        item.id === "ERR-001" ||
        item.id === "ERR-002" ||
        /errigel (modular|corner) suite/i.test(item.name),
    );
    assert.deepEqual(banned, []);
    assert.equal(sitemap.includes("/products/modular-sofa"), false);
    assert.equal(sitemap.includes("/products/corner-sofa"), false);
  });

  it("keeps genuine names that only look like codes", () => {
    const wall = shop.find((item) => item.slug === "horizontal-wall-beds-2");
    assert.ok(wall);
    assert.equal(customerFacingName(wall.name), wall.name);
  });

  it("strips confirmed vendor suffixes from customer-facing names", () => {
    assert.equal(customerFacingName("Kilkenny Mink Bed-GI"), "Kilkenny Mink Bed");
    assert.equal(customerFacingName("Capri Bar Stool GA"), "Capri Bar Stool");
    assert.equal(customerFacingName("Chrissie Dining Set HJ"), "Chrissie Dining Set");
    assert.equal(customerFacingName("Erik Round Table GA"), "Erik Round Table");
    assert.equal(customerFacingName("Brandon Armchair - IM"), "Brandon Armchair");
  });

  it("restores featured product images on disk", () => {
    const featured = shop.filter((item) => item.featured);
    assert.ok(featured.length >= 6);
    for (const item of featured) {
      assert.equal(existsSync(join(root, "public", item.image)), true, item.image);
    }
  });

  it("does not use contaminated screenshot assets in the image book", () => {
    const banned = [
      "/media/instagram/bedroom-sage.jpg",
      "/media/instagram/queen-ann.jpg",
      "/media/instagram/desk.jpg",
      "/media/instagram/antrim-bed.jpg",
      "/media/instagram/2-DQ2IhG3jHAb.jpg",
      "/media/instagram/3-DQCoQyJDMLJ.jpg",
    ];
    for (const src of banned) {
      assert.equal(selector.includes(src), false, src);
      assert.equal(store.includes(src), false, src);
    }
  });
});
