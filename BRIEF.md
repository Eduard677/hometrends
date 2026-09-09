# HomeTrends — implementation brief for Claude Code

Drop this in the repo root as `BRIEF.md` and point Claude Code at it. Copy
`catalogue/catalogue.json` and `catalogue/build-catalogue.py` into the repo first — the
brief assumes both are present.

---

You are working on HomeTrends, a static multi-page site for a family-owned furniture
showroom at 29 Parnell Street, Ennis, Co. Clare. Plain HTML, CSS and vanilla JS, deployed
to Vercel. It is a demo being pitched to the business owners.

## Start here

Before writing any code:

1. Read the repo and report its structure — pages, shared partials, CSS organisation, how
   product data currently reaches the page, and whether a product detail page exists.
2. Say which of the tasks below are already done, already half-done, or rest on an
   assumption that doesn't match what you found.
3. Propose your order of work and wait for confirmation.

Do not skip step 3. Several tasks below depend on facts about the codebase I can't see.

## Ground rules

- Do not redesign. The palette (warm cream, near-black, serif display face), layout and
  copy are approved. You are fixing defects and adding two features inside that design.
- ~~No dependencies, no framework, no build step. Vanilla JS and CSS only.~~
  **Struck 8 Sep 2026 by the structural pass.** Written for a static site; this
  repo is TanStack Start + React 19 + Vite 8 + Tailwind 4 and has a real build.
  The rule that stands: add no new npm dependency unless a task cannot be done
  with what is installed, add no second framework, and do not convert to vanilla
  HTML.
- No new animation. No hover-lift, no fade-in-on-scroll, no entrance effects.
- Fix the shared component, not the page. One defect on two pages gets one fix.
- Everything responsive to 375px, keyboard reachable, visible focus ring.
- Commit per task with a clear message. Do not batch unrelated changes.
- If a task rests on a wrong assumption, stop and say so rather than working around it.

## Data

**This is a presentation build. Make no Shopify requests.** The catalogue ships as a
static file, `catalogue.json` — 742 products scraped from hometrendsfurniture.ie on
7 Sep 2026, then cleaned. 910KB raw, ~170KB gzipped, so Vercel serves it fine, but load
it once and cache it in memory per page rather than re-parsing.

`build-catalogue.py` regenerates it from a fresh scrape. If the data needs changing,
change the script and re-run it. Do not hand-edit `catalogue.json`.

Each product:

```jsonc
{
  "id": "15403730207043",
  "handle": "troy-bookcase-hj-copy",
  "title": "Troy Cabinet",           // supplier codes (-GI, GA, HJ, -IM) stripped
  "category": "Living",              // Bedroom Living Rugs Dining Accessories
                                     // Mattresses Kids Lighting Office Garden Other
  "description": "...",              // plain text, 400 chars
  "images": ["https://cdn.shopify.com/..."],
  "options": [{"name": "Colour", "values": ["Oak", "Walnut", "Grey"]}],
  "variants": [
    {"id": "54787979018563", "label": "Oak", "price": 16900, "was": 29900, "available": true}
  ],
  "priceMin": 16900,
  "priceMax": 16900,
  "hasRange": false,                 // true -> display "From €"
  "cta": "options",                  // "add" -> Add to bag | "options" -> Choose options
  "inStock": true
}
```

Notes on the data, all already handled — do not re-derive:

- **Prices are integers in cents.** Format at render as EUR. No floating point on money.
- **`cta` and `hasRange` are independent.** 147 products have several variants at one
  price: they display a flat price *and* say "Choose options". Never infer the CTA from
  whether "From €" is showing.
- `options` omits Shopify's default `Title` option, so an empty array means single
  variant. `Color` is normalised to `Colour`. Bed sizes are normalised (`4'6` → `4ft6`).
- 123 invalid markdowns were dropped where `was` was less than or equal to `price`.
  A `was` of `null` means no markdown — render the price alone.

Catalogue shape: 317 products take a direct add-to-bag, 425 need variant selection,
278 display a price range, 15 are out of stock entirely.

---

# Part 1 — Defects

Cheap and visible. Do these first.

**1.1 Founder portrait.** The founder section renders a grey box reading "Portrait to
follow". Replace it with `assets/img/finbar-eileen.jpg`. Crop roughly 4:5, tight to the
two subjects. Assume the grade is already correct — apply no CSS filter. Alt text
exactly: `Finbar and Eileen Keaveney in their Ennis furniture showroom.`

**1.2 Mega menu.** Remove the item "Errigel" (not a real category). Change the heading
`FLOOR` to `FLOORING`. Pull "Shop all" out of the MORE column and make it a distinct link
below the grid. Replace the single "Tables & chairs" entry in the under-filled DINING
column with the three categories that genuinely exist: **Dining Tables**, **Dining Chairs
& Benches**, **Dining Sets**. Replace the left panel image (a red branch with fabric
shapes) with a room-set photograph from the repo.

**1.3 Price divider rule.** A hairline appears above the price on some cards and not
others, apparently tied to whether the title wraps. Attach it to the price block
unconditionally.

**1.4 Review baselines.** The three testimonials differ in length so the reviewer name and
"Read on Google" sit at three heights. Full-height flex column per card, attribution
pushed down with `margin-top: auto`.

**1.5 Cart badge.** The counter renders as a detached numeral above and right of the bag
with no container, reading as a stray character. Filled pill tucked against the icon,
hidden at zero:

```css
.bag { position: relative; }
.bag__count {
  position: absolute; top: -2px; right: -6px;
  min-width: 16px; height: 16px; padding: 0 4px;
  display: grid; place-items: center;
  border-radius: 999px; background: currentColor;
  color: var(--bg); font-size: 10px; line-height: 1;
}
.bag__count[hidden] { display: none; }
```

The bag sits over both cream and photographic backgrounds — check contrast in both. Give
it an `aria-label` including the count.

**1.6 Sticky header clips headings.** Add `scroll-margin-top` equal to header height on
every section that can be anchored to.

**1.7 Opening hours.** "Open until 6pm today" is hardcoded. Derive from Mon–Sat
09:30–18:00, Sunday closed, and handle the closed and opens-tomorrow states.

---

# Part 2 — Layout and sizing

**2.1 Carousel images don't fill their cards.** In "Explore by space" each card has a
vertical band down its left edge — grey on Living room, cream on Dining room. Fixed
`aspect-ratio` on the media wrapper, image fills it.

**2.2 Product image scale is inconsistent.** In one row: a cutout filling its frame, a
small cutout adrift in a large box (Capri Bar Stool is the worst), a full-bleed lifestyle
photo.

Same `aspect-ratio` on every product media wrapper. Then split by asset type, flagged with
a class or data attribute: lifestyle gets `object-fit: cover`, cutouts get
`object-fit: contain`.

Be clear about the limit here: **`contain` will not equalise how much of the frame each
object fills.** The bar stool has empty margin baked into the source file and `contain`
preserves it faithfully. No `object-fit` value fixes that — the asset needs re-exporting.
So: implement the split, then measure each cutout's object bounding box as a fraction of
image area and report anything under ~70%. A per-image `transform: scale()` driven by a
data attribute is an acceptable stopgap for the demo if flagged as one.

**2.3 Bar stool cutout has white background trapped between its legs.** Asset defect.
Report it, don't edit the image.

**2.4 Two clashing photographs.** The Cedarwood Nore Oak Bed shot (striped rug, rainbow
pencil artwork) and the Erik Round Table shot (low-res white-background composite) fight
the muted palette. Remove both from the homepage featured rows; they can stay in the
range listing.

**2.5 Stock state is invisible.** 15 products are entirely out of stock and 236 variants
individually. Disable unavailable variants in the PDP selector rather than hiding them,
and mark cards where `inStock` is false.

**2.6 Sale prices.** Render the strikethrough only when `was` is present — the data has
already dropped the invalid ones. Separately: 86% of the catalogue carries a markdown, so
a strikethrough on nearly every card reads as a clearance outlet and fights the premium
positioning. Suppress it in the homepage featured rows; keep it on the range page.

**2.7 Carousel has no snap and shows a native scrollbar.** Cards rest at arbitrary offsets
with adjacent cards clipped, scrollbar track visible. Add `scroll-snap-type: x mandatory`
and `scroll-snap-align: start`, hide the scrollbar cross-browser, add prev/next controls
as real buttons, keyboard operable, disabled at each end.

**2.8 Gallery tiles are uneven.** "In homes and in store" has four widths and one caption
describing one of them. Uniform grid, drop the orphaned caption.

**2.9 Sort control is an unstyled native select.** Keep it native — do not build a custom
ARIA listbox. Style the closed control with `appearance: none`, the site's own font and
border, custom chevron via background image. The open list stays native; that's fine.

**2.10 The heart icon leads nowhere.** Build a saved-items page on `localStorage` or
remove the icon. Removing it is acceptable — say which you chose.

**2.11 Section spacing.** Rhythm varies section to section. One scale via a custom
property, `clamp(6rem, 12vw, 10rem)` block padding on every top-level section, content at
the top, padding not varying with content length.

**2.12 Reduce uppercase.** Tracked-out caps currently on the eyebrow, the LIVING ROOM
caption, VIEW ALL FURNITURE, FOLLOW US ON INSTAGRAM, the SHOP/VISIT tabs and the menu
column headings. Keep caps for the menu column headings only; sentence case elsewhere.

**2.13 Drop arrow suffixes.** Remove the trailing "→" from "View all furniture", "Explore
living room", "Read on Google", "Follow us on Instagram". Keep them on the carousel
controls from 2.7.

**2.14 Collapse header search to an icon.** The 450px bordered input carries the same
weight as the logo. Replace with an icon opening the existing full-screen overlay. Don't
change the overlay.

---

# Part 3 — Product page and variant selection

**Check first: does a product detail page exist?** If not, say so before starting — it is
a prerequisite for both the cart and the filters, and it changes the scope materially.

**3.1 Two rules, never conflated.**

*CTA*, from `cta`: `"add"` → "Add to bag", may act directly. `"options"` → "Choose
options", navigates to the PDP, never adds to the basket.

*Price*, from `hasRange`: `false` → flat price (`€149`). `true` → `From €399`.

Capri Bar Stool is the worked example: five colours all at €149, so it shows a flat €149
*and* says "Choose options".

**3.2 Variant selector.** Drive it off `options[].name` generically — do not hardcode Size
and Colour, there's a long tail of `Style`, `Storage`, `Material` and others. Selecting a
variant replaces the range with that variant's exact price. Unavailable variants disabled
and visibly so. Add to bag disabled until a selection is made, with the reason stated
rather than the button silently inert.

**3.3 Featured rows can't demo the cart as populated.** Of the six featured products
exactly one is single-variant (Chrissie Dining Set). Five "Choose options" against one
"Add to bag" is a poor row to walk a basket through. There are 317 single-variant
products, 114 in stock with multiple images between €200 and €2,500. Propose a
replacement set so at least half the row offers direct add-to-bag, and **report the list
before changing anything** — this is a content decision.

---

# Part 4 — Cart

Local only. No network calls in the cart path at all. This runs live in front of the
business owners, possibly on showroom wifi; a cart that can't make a request can't fail in
front of them. Every page is a cold start — there is no shared JS context.

**4.1 Cart module.** One module, all pages. Lines stored under a single namespaced
`localStorage` key, each holding product id, variant id, title, variant label, unit price
in cents, image, quantity. Operations: `add`, `setQuantity`, `remove`, `clear`,
`getLines`, `getCount`, `getSubtotal`.

- Same variant twice increments one line. Different variants of one product are separate
  lines.
- Every read in try/catch, falling back to an empty cart on malformed JSON. A bad key must
  never throw and take the page down.
- Integer cents throughout, formatted only at render.

**4.2 Badge.** Repaints on `DOMContentLoaded` on every page from `localStorage`. Hidden at
zero. Styling from 1.5.

**4.3 Add to bag.** Per the 3.1 rule. Bind by delegation from `document` so it survives
async rendering. On click: update cart, update badge, open drawer, brief confirmed state
on the button. No toast covering content, no spinner — this is synchronous, it should feel
instant.

**4.4 Drawer.** Slides from the right. Line items with thumbnail, title, variant label,
unit price, quantity stepper, per-line remove. Subtotal. A line noting delivery is
calculated at checkout. Primary "Checkout", secondary "Continue browsing".

Changes re-render immediately, no reload. Empty state is designed, not blank — one line of
copy and a link into the range. Trap focus, close on Escape and backdrop, restore focus to
the trigger, lock body scroll. Existing palette and type, no new visual language.

**4.5 Checkout.** Do not build a checkout and do not fake a payment form. The button opens
an interstitial showing the order summary and a short line explaining payment is handled
by Shopify's secure checkout in the live build.

**4.6 Reserve to view in Ennis.** Now secondary, PDP only, text or outline style beneath
Add to bag. Remove it from card grids. Opens a modal with name, phone, email, product
prefilled, optional note. **The confirmation must state plainly that nothing was sent** —
wording to the effect of "Demo only — this request has not been sent." A confirmation
implying real submission would mislead anyone using the demo, the client included.

**4.7 Demo reset.** A way to clear the cart between run-throughs — `?reset` or a keyboard
chord, documented in the README, not visible in the UI. Presenting twice with items
already in the bag looks broken.

---

# Part 5 — Filters and sort

**5.1 Filters on the range page.** 742 products, sort is currently the only control.

Facets: **category** (from `category`, eleven values, counts in
`catalogue-report.md`), **price band**, **colour** (from any option named `Colour`), and
**availability** (in stock only).

- Filter state in the URL query string so a filtered view is linkable and survives reload.
- Live result count. Empty state that says which filter to relax, not just "no results".
- Filter in memory over the parsed catalogue. No network, no re-fetch.
- With 742 products, render progressively — paginate or lazily reveal rather than
  inserting 742 cards. Measure it; if a full render is under ~100ms, keep it simple.

**Leave size out of the facets.** Bed sizes are normalised but still share the `Size`
option name with rug dimensions (`Medium 120x170`), so a size facet mixes incompatible
vocabularies. Note it as future work.

**5.2 Sort.** Featured, price low to high, price high to low, newest. Sorting on
`priceMin`. Reflect in the URL alongside the filters.

**5.3 Delivery and lead time** on cards and the PDP. This is the deciding question for
furniture buyers and the site's own reviews are almost entirely about delivery and
assembly. Currently it appears only as a footer link.

---

# Done means

- No placeholder text anywhere. Grep for "to follow", "TODO", "lorem", "placeholder",
  "coming soon".
- Cards in a row are the same height. Lifestyle images fill their frames. Cutouts aren't
  cropped into, and any under ~70% frame fill is reported.
- No card offers "Add to bag" for a product with more than one variant. This is stricter
  than "no From € on an add card" — 147 products have several variants at one price.
- No strikethrough renders where `was` is null.
- No page shows "Color", and no page renders `Title` as an option name.
- No icon in the header leads nowhere.
- The cart survives navigation and a browser refresh with the right count and lines.
- The cart path issues zero network requests. Confirm in the network tab.
- Filters survive a reload via the URL.
- Everything keyboard reachable with a visible focus ring. Intact at 375, 768 and 1440.
  No console errors. `prefers-reduced-motion` respected.

**Walk it through by hand before reporting done.** Add a single-variant product from a
card. Navigate to the range page — badge count survives. Filter by category, reload the
page, filters persist. Open a multi-variant product, select a size, price updates, add it.
Add the same variant again, it increments. Open the drawer, change a quantity, remove a
line. Reach the checkout interstitial. Refresh, cart intact. State that you did this.

# Do not

- Change the palette, typefaces or type scale.
- Rewrite approved copy. Case changes for 2.12 are fine; rewording is not.
- Add a build step, framework or npm dependency.
- Make any Shopify request.
- Build a fake payment form.
- Replace a native form control with a custom one.
- Invent menu categories to balance a column.
- Hand-edit `catalogue.json` — change `build-catalogue.py` and re-run.
- Touch the hero section. It is finished.
