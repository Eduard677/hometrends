# Home Trends Furniture — remaining work (tasks 2–6)

## Media pack — unpack first

Press-to-download archives (from Eduard / Grok Bot):

| Archive | Size | Unpack to |
| --- | --- | --- |
| `ht-media-core.tgz` | ~13MB | Extract → merge `public/media/` into repo `public/media/` |
| `ht-media-google.tgz` | ~20MB | Optional `asset-inbox/google/` |
| `ht-media-website.tgz` | ~4MB | Optional `asset-inbox/website/` |
| `ht-media-cdn.tgz` | ~10MB | Optional `asset-inbox/cdn/` |

**KEEP / re-crop (files already in core pack):** shopfront-parnell-street.jpg, delivery-truck, all 5 category cards, nav set, gallery, details, showroom google floors, brand/OG/favicon, clare-delivery.svg, fabric-swatch-01..08.

**ImageSlot only (do not invent):** `finbar-eileen.jpg`, showroom-loop.mp4, final left-space hero (keep stopgaps), clean sofa-base+mask if provisional pack files are rejected (prefer 8 swatches / variants path).

---

## Context

Marketing site for Home Trends Furniture, family-owned, 29 Parnell Street, Ennis, Co. Clare, V95 ED79. Phone 065 679 7853. Owners Finbar and Eileen Keaveney, since 2013. Vercel. Shopify-origin catalogue.

Job: get someone to drive into Ennis and walk through the door — not primarily e-commerce.

**Task 1 (header, search, mega menu) is done. Do not modify header / search overlay / mega menu.**

Reference components: `FabricStudio.jsx`, `ProductCard.jsx`, `OwnersSection.jsx`, `VisitSection.jsx`, `Reviews.jsx`, `ImageSlot.jsx` — adapt to repo conventions.

## Hard constraints

- Palette only: `#EFEAE1` `#E8E3D9` `#1C1C1A` `#6B6660` `#DDD5C7` `#F4F1EA` `#E2DACC`
- Existing serif + sans only; max five type sizes
- One container width + one left margin site-wide (fix Finbar section vs Explore by space first)
- No letterboxing; no white rectangle inside cream tiles
- Motion: opacity + small translate, 400–600ms ease-out; prefers-reduced-motion
- Never invent business facts — report gaps
- Never download/generate/substitute photography — keep existing, ImageSlot for missing

## Visit / reviews facts (do not invent beyond this)
- Parking: Public parking on Parnell Street, with Friary and Cornmarket car parks a short walk away. (Not “across from the Old Ground”.)
- Directions: https://maps.app.goo.gl/gvfKib6Bakh1eito8
- Hours Europe/Dublin Mon–Sat 09:30–18:00, Sunday closed
- Google aggregate ~4.9 / ~95 — verify live before hardcoding; review bodies stay placeholders; no fake Finbar quote

## Task 2 — Replace Errigel with FabricStudio
Delete flat grey + rainbow chips + “may not exist” disclaimer. Build FabricStudio: mask path OR eight variants/swatches (`#4A5560` Charcoal blue, `#D3C8B4` Oatmeal, `#6B7358` Moss, `#B08268` Clay, `#6E727A` Slate, `#2F3A4A` Ink navy, `#8A7F8C` Heather, `#E2DCD0` Chalk). No word “Errigel”. Until sofa-base/mask accepted, swatch row live + ImageSlot (or use pack swatches as variants).

**Done when:** keyboard tab through 8 swatches; name/description update; no saturated web colours; no disclaimer; works with image absent.

## Task 3 — One ProductCard treatment
4:5 object-cover; script re-export white BG shopify images onto `#EFEAE1`; one price default (wasPrice prop only); CTA “Reserve to view in Ennis” → hometrendsennis@gmail.com; bag mode prop unused by default; availability “On the floor now” / “To order, approx 4–6 weeks”.

**Done when:** same card everywhere; no white-in-cream at any viewport.

## Task 4 — Owners / Visit / Reviews / dedupe contact
OwnersSection: photo (ImageSlot if missing), pull quote placeholder, two sentences, link /about — move address/hours/phone out.
VisitSection: dark `#1C1C1A`, live open/closed Europe/Dublin, phone filled button, shopfront photo, address+Eircode, hours, parking, maps link.
Reviews: aggregate + three simultaneous reviews linked to Google; placeholder bodies.
Contact details once in Visit + footer only.

## Task 5 — Catalogue scripts
Re-map living-room junk; CSV for SKU names (do not rename); strip supplier suffixes; title case; regenerate slugs + 301s; fix known typos; CSV missing specs; paginate/lazy-load collections.

## Task 6 — Technical polish
Unique meta; Product+LocalBusiness JSON-LD; alt text; WebP+JPEG; size budgets; hero video optional with poster / reduced-motion fallback; consolidate /showroom /come-in /find with 301s.

## Working method
Order 2→6; commit per task; build+lint after each; defer business judgements in summary.
