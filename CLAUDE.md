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

## Deploying — read this before debugging a failed build

**Pushing to `main` does not deploy. The GitHub build always fails, and it is
not your diff.** Every git-triggered production build errors with:

```
Error: ENOENT: no such file or directory, scandir '.vercel/output/static/media'
  at scripts/prepare-deployment-media.mjs:9
```

`scripts/finalize-vercel.mjs:9` imports `prepare-deployment-media.mjs`, which
walks `.vercel/output/static/media`. That exists only when `public/media/` is
present at build time — and `public/media/` is gitignored (~590 MB), so it never
reaches GitHub. This fails identically for every commit, including a one-line
formatting change.

Do **not** make that script tolerate a missing directory. The build would then
pass and ship a site with no product photography, which is worse than failing
loudly. Giving the media a real home (Vercel Blob, Git LFS, or committing it) is
an open decision — ask, don't pick one unilaterally.

So GitHub will show a red production check on `main` after every push, and
`hometrends-deploy-git-main-themedforge.vercel.app` points at the failed build.
Production itself is unaffected.

### Ship from the CLI, from a clone that has the media

```bash
# once per clone, if .vercel/project.json is missing
npx vercel link --yes --project hometrends-deploy --scope themedforge

npm run build                        # emits .vercel/output, prunes unused media
npx vercel deploy --prebuilt --prod --yes
```

`.vercel/` and `.env.local` are gitignored, so linking never dirties the repo.
The output is ~524 MB but is content-addressed and deduplicated — a routine
deploy uploads only a few MB.

Afterwards confirm the alias actually moved: the deployment should list
`hometrends-deploy.vercel.app` in `alias` with `aliasError: null`. After a
`vercel rollback` the alias stays pinned and needs an explicit
`npx vercel promote <url> --scope themedforge --yes`.

### A fresh clone has no images

```bash
cp -Rc ~/Downloads/hometrends-grok/public/media public/media
```

`cp -Rc` clones on APFS — instant, no extra disk. The files stay untracked;
`git ls-files public/media | wc -l` must stay `0`.

`~/Downloads/hometrends-grok` is an asset donor **only**. Its git history is
unrelated to `origin/main` (no merge base), so never commit or push from there.

### Verify against the build, not just dev

Reading `STORE` at module-evaluation time crashes the server build while
`npm run dev` stays green — dev serves unbundled modules, so the chunk ordering
does not exist there. Anything touching `STORE` must be deferred to render.
Product routes SSR only a shell, so `curl | grep` for component markup returns
nothing even when the page is fine; check in a real browser.
