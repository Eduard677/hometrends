# Home Trends Furniture

Production source for [hometrends-deploy.vercel.app](https://hometrends-deploy.vercel.app) — the family furniture showroom at 29 Parnell Street, Ennis, Co. Clare (Finbar & Eileen Keaveney, since 2013).

This is the live site as of 29 August 2026. Give this folder to Claude Code.

## Stack

- TanStack Start (file routes in `src/routes/`)
- Vite 8 + Tailwind v4 (`src/styles.css` is the design system)
- React 19
- Zustand bag, persisted as `ht-bag` in localStorage
- Product catalogue is static: `src/lib/catalog.ts` (57 pieces)
- No Shopify checkout yet — bag emails the showroom

## Run

```bash
npm install
npm run dev
```

Dev server: `http://localhost:8080`

```bash
npm run typecheck
npm run build
```

## What not to do

- Do not redesign or rewrite the homepage editorial unless asked. Copy and layout are deliberate.
- Do not invent products. Flooring (3), garden (2), mattresses (2), lighting (3) are the real counts.
- Do not add fake reviews. Google names live in `src/lib/reviews.ts`.
- Do not commit `.env.local` or `.vercel/`.

## Map

| Path | What |
|---|---|
| `src/routes/index.tsx` | Homepage |
| `src/components/chrome.tsx` | Header, menu, search, footer |
| `src/lib/catalog.ts` | Products + collections |
| `src/lib/bag.ts` | Cart store |
| `src/lib/store.ts` | Address, phone, hours, Instagram |
| `public/media/` | Brand, editorial, product photography |
| `src/styles.css` | All visual language |

Live production: Vercel project `hometrends-deploy` (themedforge).

## Deploying

**Pushing to `main` deploys.** Vercel builds the commit and moves
`hometrends-deploy.vercel.app` itself. Confirm with the deployment's `alias`
list and `aliasError: null`; after a `vercel rollback` the alias stays pinned
and needs `npx vercel promote <url> --scope themedforge --yes`.

This only started working once the media was committed. Before that, every
git build died in `scripts/prepare-deployment-media.mjs` with ENOENT on
`.vercel/output/static/media`, because `public/media/` was gitignored wholesale
and never reached GitHub — so production could only be updated by a CLI deploy
from a machine that happened to hold the photo pack.

### The media rules that keep it working

`.gitignore` is an **allowlist**: only assets the site actually references are
tracked (~3090 files, ~154 MB). If you add an image, check it is not silently
ignored — `git status` should show it, and `git check-ignore -v <path>` tells
you which rule caught it.

- **The catalogue is WebP only.** Product entries in `src/data/ht-shop.json`
  have no `fallback` key; `ProductMedia` then renders `<img src={src}>` with no
  `<source>`. Do not reintroduce `.jpg` fallbacks — it doubles the pack.
- Catalogue images are 800px wide at WebP q72. Keep new ones in that range;
  `prepare-deployment-media.mjs` throws on any deployed image ≥200 KB.
- The raw `shopify` pack, the unreferenced `hero`/`nav`/`detail`/`fabric`/
  `gallery`/`showroom`/`maps` stopgaps and the per-image `.json` sidecars are
  deliberately untracked. The full original pack lives in
  `~/Downloads/hometrends-grok/public/media` — asset donor only, its git
  history is unrelated to `origin/main`, so never commit or push from there.

Do not make `prepare-deployment-media.mjs` tolerate a missing media directory.
That would let a build pass and ship a site with no product photography.

### Deploying by CLI instead

```bash
npx vercel link --yes --project hometrends-deploy --scope themedforge  # once
npm run build
npx vercel deploy --prebuilt --prod --yes
```

`.vercel/` and `.env.local` are gitignored, so linking never dirties the repo.

### Verify against the build, not just dev

Reading `STORE` at module-evaluation time crashes the server build while
`npm run dev` stays green — dev serves unbundled modules, so the chunk ordering
does not exist there. Anything touching `STORE` must be deferred to render.
Product routes SSR only a shell, so `curl | grep` for component markup returns
nothing even when the page is fine; check in a real browser.

---

# Phase 0 — orientation findings

Recorded so later sessions do not re-derive this. Audited on branch
`phase-0-orientation` against the deployed build; no code was changed.

## 1. Stack, build, routes

TanStack Start (`@tanstack/react-start`) on Vite 8, React 19, TypeScript.
Tailwind v4 is present but see §3 — it is not where the design lives.

Routes are **file-based and generated**. `src/routes/*.tsx` each export
`createFileRoute("/path")`; `@tanstack/router-plugin` regenerates
`src/routeTree.gen.ts` (88 route imports) at dev/build time. Never hand-edit
that file. `vite.config.ts` runs `tanstackStart()` last, deliberately after an
auth-popup rule so `/auth/popup` cannot fall through to the SPA.

`npm run build` = write-sitemap -> vite build -> finalize-vercel -> db:migrate.

## 2. Products and collections

All 742 products come from **one static file**, `src/data/ht-shop.json`,
imported by `src/lib/catalog.ts:2`, normalised into `SHOP` (`catalog.ts:412`)
and re-exported as `PRODUCTS` (`:434`). There is no database and no CMS behind
the catalogue; `src/lib/db.ts` and `src/lib/auth/` exist but the shop does not
use them.

Collections do **not** hold product lists. `COLLECTIONS` is a separate array of
metadata, and membership is computed by tag match at read time:

    PRODUCTS.filter(item => item.tags.includes(key) || item.tags.includes(slug))
    // src/lib/catalog.ts:458

So a product belongs to a collection only if its `tags` contain that
collection's key or slug. This is the mechanism behind the Phase 2 "Living room
exists twice" finding: `living-room` and `sofas-chairs` are two independent tag
buckets that overlap, not a parent and child.

Related products are also tag-based (`catalog.ts:428`).

## 3. Design tokens — neither Tailwind config nor one file

**There is no `tailwind.config.*`.** `src/styles.css` does
`@import "tailwindcss"` and declares a `@theme` block, but almost nothing in
the site is built from Tailwind utilities; the visual language is hand-written
CSS.

Custom properties are spread across the nine stylesheets, which load in this
order from `src/routes/__root.tsx` — **last wins**:

    styles.css, styles.apple.css, stage2, stage3, stage4, stage5, stage6,
    showroom, stage7

Distinct custom properties declared per sheet: styles.css 45, apple 45,
stage2 31, stage4 9, showroom 7, stage6 7, stage7 2, stage3 0, stage5 0.

**The main hazard in this repo.** The same selector is redefined across four or
more layers, several with `!important`, and later `main`-qualified selectors
(0,1,1) silently beat bare classes (0,1,0) written in stage7. Three fixes in
one session were lost this way before being re-qualified:
`main .product-gallery__thumbs`, `main .reviews-section__grid`,
`main .room-tiles`. **Always grep all nine sheets before concluding a rule does
not exist, and check specificity, not just load order.**

## 4. Images — what the media split means

Two different pipelines, and the split is the point:

- **`public/media/optimized/`** (70 files, 9 MB) is *generated*.
  `scripts/optimize-site-media.mjs` scans `src/**/*.{ts,tsx,css}` for
  `/media/...` references, re-encodes each to webp + jpg at a content hash, and
  writes `src/data/site-media.json` mapping the original path to
  `{src, fallback, blur}`. `SiteImage` reads that manifest. This is the path
  every editorial/brand/story photograph takes.
- **`public/media/catalogue/`** (8829 files, 360 MB on disk) is *supplied
  product photography*, referenced directly from `ht-shop.json`, and is
  **explicitly excluded** from the optimiser at
  `scripts/optimize-site-media.mjs:16`. It never gets a manifest entry, a blur
  placeholder, or a `srcset`.

Git tracks only what the site references: 2943 catalogue `.webp`, 70 optimized,
32 editorial, 19 brand, 10 instagram, 7 category, 5 story, 5 shopify. The rest
of `catalogue` (the `.jpg` twins and `.json` sidecars) and almost all of
`shopify` (733 files, 137 MB, of which 5 are used) stay local-only via the
`.gitignore` allowlist.

Catalogue images are **webp-only** — the `fallback` keys were removed from
`ht-shop.json`, so `ProductMedia` emits a bare `<img src=…webp>` with no
`<picture><source>`. Confirmed live: 0 `<source>` elements in the PDP gallery.

## 5. Head and meta — per-page, no shared component

**There is no shared head/meta component.** `src/components` contains none, and
16 route files each declare their own `head: () => ({ meta: [...] })`.
`__root.tsx` supplies sitewide defaults (`title: APP_NAME`) plus one
`application/ld+json` script.

Consequence for Phase 1: there is no single place to add og/canonical tags
today. Either a shared helper is introduced, or the same block is repeated 16
times. `src/lib/seo.ts` already exists and is the natural home.

## Verify items from the brief — resolved

**Canonical — CONFIRMED ABSENT.** No `<link rel="canonical">` anywhere in
`src/` or in the live HTML. The only `canonical` matches are a stage6 CSS
comment and `productRedirect()` in `products.$slug.tsx:17`, which issues 301s
for retired slugs — unrelated.

**JSON-LD — CONFIRMED PRESENT, and richer than the brief assumes.**
`src/lib/seo.ts` already emits:

- `localBusiness()` sitewide from `__root.tsx:20` — `["LocalBusiness",
  "FurnitureStore"]` with `@id`, `name`, `url`, `telephone`, `email`,
  `foundingDate`, full `PostalAddress`, `openingHoursSpecification`
  (Mo–Sa 09:30–18:00), and `hasMap`.
- `productSchema()` on PDPs from `products.$slug.tsx:25` — `Product` with
  `name`, `productID`, `description`, absolute `image` array, `url`, and an
  `AggregateOffer` carrying `priceCurrency: EUR`, `lowPrice`, `highPrice`,
  `offerCount` and a `seller` `@id` reference.

Still missing against the Phase 1 target: `geo` and `sameAs` on the business;
`sku`, `brand`, `availability`, `itemCondition` on the product; and
`BreadcrumbList` anywhere. No `AggregateRating` is hand-authored, which is
correct and should stay that way.

**PDP gallery duplication — CONFIRMED, and it is separate `<img>` elements.**
Measured on `/products/kilkenny-mink-bed`: **12 `<img>`, 6 unique sources** —
6 in the slide track, 6 in the thumbnail strip. Not a CSS clone. No `srcset` on
any of them, and a thumbnail renders at **122px while loading the full
800×1000 file**. The brief's concern is real: mobile pulls twelve full-size
images for one bed.

## Corrections to the brief

- `og:title` sitewide is confirmed (`Home Trends Furniture` on every page), but
  the brief's premise that JSON-LD may be absent is wrong — see above. Phase 1
  is an *extension* job, not a from-scratch one.
- The truncated meta description is generated by `productDescription()` in
  `src/lib/seo.ts`. Both bugs the brief names are visible in that one function:
  it prefixes `${name}.` (the duplicated product-name prefix) and slices to a
  fixed `110 - name.length` character budget.
- The phased remediation brief is **not** in the repo. `BRIEF.md` at the repo
  root is the older implementation brief (Parts 1–5, the one `stage7.css`
  comments cite) and has no phases.
