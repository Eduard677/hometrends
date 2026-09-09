import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const chrome = readFileSync(join(root, "src/components/chrome.tsx"), "utf8");
const confirm = readFileSync(join(root, "src/components/bag-confirm.tsx"), "utf8");
const wish = readFileSync(join(root, "src/lib/wishlist.ts"), "utf8");
const bagPage = readFileSync(join(root, "src/routes/bag.tsx"), "utf8");
const wishDrawer = readFileSync(join(root, "src/components/wishlist-drawer.tsx"), "utf8");
const qty = readFileSync(join(root, "src/components/qty-stepper.tsx"), "utf8");

describe("stage 5 shopping feedback", () => {
  it("does not auto-open the bag drawer on add", () => {
    assert.match(chrome, /openBag:[\s\S]*setBag\(true\)/);
    assert.match(chrome, /addToBag:[\s\S]*setBag\(false\)/);
    assert.match(chrome, /addToBag:[\s\S]*setConfirm\(\{ slug, name \}\)/);
    assert.equal(confirm.includes("View bag"), true);
  });

  it("keeps a compact confirmation with View bag", () => {
    assert.equal(confirm.includes("View bag"), true);
    assert.equal(confirm.includes("is in the bag"), true);
    assert.equal(confirm.includes("onDismiss"), true);
  });

  it("deduplicates wishlist slugs", () => {
    assert.equal(wish.includes("seen.has(slug)"), true);
  });

  it("uses truthful enquiry language instead of checkout", () => {
    assert.equal(bagPage.includes("Shopify checkout"), false);
    assert.equal(bagPage.includes("does not take payment"), true);
    assert.equal(wishDrawer.includes("Your saved pieces"), true);
    assert.equal(wishDrawer.includes("Explore furniture"), true);
  });

  it("keeps three-zone quantity controls", () => {
    assert.equal(qty.includes("Decrease quantity"), true);
    assert.equal(qty.includes("Increase quantity"), true);
    assert.equal(qty.includes("qty__num"), true);
  });
});
