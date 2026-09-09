# Home Trends Furniture — demo build

Static-catalogue demo of the showroom site for Finbar and Eileen Keaveney,
29 Parnell Street, Ennis, Co. Clare. Built to be walked through in front of the
business owners.

## Run

```bash
npm install
npm run dev          # http://localhost:8080
npm run typecheck
npm run build
```

## Presenting it

**Reset the bag between run-throughs.** Append `?reset` to any URL:

```
http://localhost:8080/?reset
```

That clears the cart and its `localStorage` key. There is deliberately no button
for it in the UI. Presenting twice with items already in the bag looks broken.

**The cart makes no network requests.** Add, quantity, remove and checkout are
all local, so nothing in that path can fail on showroom wifi. Checkout stops at
an interstitial explaining that Shopify handles payment in the live build — no
payment form is built or faked. "Reserve to view in Ennis" likewise states
plainly that nothing was sent.

## Catalogue

742 products scraped from hometrendsfurniture.ie on 7 Sep 2026 and cleaned.
`src/data/ht-shop.json` is the file the site reads. **Do not hand-edit it.**

| Script | What it does |
| --- | --- |
| `scripts/backfill-catalogue.mjs` | Merges `catalogue/catalogue.json` into `ht-shop.json` — variant options, stock, CTA rule, prices in cents |
| `scripts/split-dining-collections.mjs` | Derives the three dining sub-collections from product names |
| `scripts/classify-product-media.mjs` | Classifies card images as lifestyle or cutout and measures frame fill → `src/data/image-fit.json` |

All three are re-runnable and idempotent. Regenerate rather than edit by hand.

### Two rules that are never conflated

- **CTA** comes from `cta`: `"add"` may add to the bag directly, `"options"` must
  route to the product page. 317 and 425 products respectively.
- **Price display** comes from `priceVaries`: flat price, or `From €`.

They are independent. Capri Bar Stool is five colours at one price: it shows a
flat €149 *and* says "Choose options". Never infer one from the other.

**Money is integer cents throughout**, formatted only at render by `euro()`.

## Known gaps

- The founder portrait is missing. `src/components/owners-section.tsx` renders an
  `ImageSlot` until `public/media/story/finbar-eileen.jpg` exists; crop and alt
  text are already set.
- 277 cutouts under-fill their frame and 59 have a white background trapped in
  enclosed areas. Both are asset defects needing a re-export, listed in
  `reports/cutout-frame-fill.md`. A flagged `transform: scale()` stopgap softens
  the first for the demo.
- Size is not a filter facet: bed sizes still share the `Size` option name with
  rug dimensions, so the facet would mix vocabularies.
