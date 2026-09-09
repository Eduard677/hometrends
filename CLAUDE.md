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
