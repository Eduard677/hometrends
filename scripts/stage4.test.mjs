import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
const chrome = readFileSync(join(root, "src/components/chrome.tsx"), "utf8");
const reviews = readFileSync(join(root, "src/lib/reviews.ts"), "utf8");
const stay = readFileSync(join(root, "src/components/stay-in-touch.tsx"), "utf8");
const selector = readFileSync(join(root, "src/components/interactive-selector.tsx"), "utf8");

describe("stage 4 homepage close", () => {
  it("uses the eight approved Errigel colours in order", () => {
    const colours = [
      ["Charcoal blue", "#264653"],
      ["Deep teal", "#2A9D8F"],
      ["Sage green", "#8AB17D"],
      ["Golden amber", "#E9C46A"],
      ["Warm orange", "#F4A261"],
      ["Terracotta", "#E76F51"],
      ["Muted plum", "#6D597A"],
      ["Dusty rose", "#B56576"],
    ];
    let cursor = 0;
    for (const [name, hex] of colours) {
      const nameAt = index.indexOf(name, cursor);
      const hexAt = index.indexOf(hex, cursor);
      assert.ok(nameAt > -1, name);
      assert.ok(hexAt > -1, hex);
      cursor = Math.max(nameAt, hexAt);
    }
    assert.equal(index.includes("Ink blue"), false);
    assert.equal(index.includes("Colour for your room"), true);
  });

  it("does not keep a fixed newsletter overlay", () => {
    assert.equal(chrome.includes("NewsletterBar"), false);
    assert.equal(chrome.includes("NewsletterBand"), true);
    assert.equal(stay.includes("orior-bar"), false);
    assert.equal(stay.includes("New pieces, from the floor"), false);
    assert.equal(stay.includes("Keep in touch"), true);
  });

  it("keeps verified Google review names and source labels", () => {
    for (const name of ["Tomasz Kotowski", "Lisa McI", "Gemma Casey", "Caroline O'Brien", "Magda Chelstowska"]) {
      assert.equal(reviews.includes(name), true, name);
    }
    assert.equal(reviews.includes('source: "Google"'), true);
    assert.equal(index.includes("review.source"), true);
  });

  it("keeps the image book on genuine assets", () => {
    assert.equal(selector.includes("/media/editorial/from-shop-bedroom.jpg"), true);
    assert.equal(selector.includes("/media/instagram/bedroom-sage.jpg"), false);
    assert.equal(chrome.includes("Furniture for real rooms, in Ennis."), true);
  });
});
