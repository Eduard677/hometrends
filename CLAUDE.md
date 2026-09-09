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
