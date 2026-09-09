# Task 6 — technical polish and handoff

## Implemented

- Product-specific descriptions, collection-specific descriptions and Product JSON-LD, plus LocalBusiness/FurnitureStore JSON-LD with telephone, postal address, V95 ED79 and opening hours. Metadata construction is deferred until render to avoid the production bundler's circular module initialization.
- `/showroom` is the single visit page. `/come-in` and bare `/find` permanently redirect there. `/find?q=…` permanently redirects to `/shop?q=…` so the frozen Task 1 search keeps working. Product aliases are permanent redirects too.
- `SiteImage` supplies local WebP, JPEG fallback and blur placeholders. `optimize-site-media.mjs` optimizes 34 existing supplied images; no new photography is generated. The hero supports optional autoplay/muted/loop/playsInline video, rendered only after mount and only without reduced-motion preference; absent/failed video uses the static poster.
- The supplied shopfront share card is wired to `public/og.jpg`. The shopfront photo's window signage is retained because the brief expressly requires that photograph; this is not a product promotion or an asserted current sale.
- Five content sizes (14/16/24/40/64px), existing two font families, common page padding and alternating cream/alternate homepage sections. Content motion is opacity/translate only, 500ms ease-out without delays; reduced motion disables it. Task 1 chrome styles remain unchanged.
- `/saved` works with the existing local saved-items store; product pages have a secondary text save control. Cards have no heart and retain one primary reservation enquiry action. Test saved items were removed after verification; no bag items were seeded.
- Final build processing prunes unreferenced media and metadata sidecars from disposable deployment output only, and compresses referenced legacy originals. All supplied source files remain recoverable in the working tree/cache. See deployment-media.json for exact build-only removals.

## Image exclusions

- OCR scanned all 2,943 unique original files; contact sheets were inspected. 27 unique images are excluded for supplier branding/watermarks or sale/price signage. Reasons are recorded in excluded-images.json, with OCR evidence in image-text-audit.json.
- The full catalogue retains all 742 products and 2,929 accepted gallery entries. Seven Natural Sleep mattresses now need replacement photographs rather than displaying prohibited branded imagery. Names/IDs are in final-catalogue-audit.json.
- The low-resolution watermarked Sleep Rest 800 phone photo was removed from the homepage strip in Task 4. Four panels remain.

## Other removals

- Removed unsupported extended history/awards/quotes, fabric-count/exclusivity/consultation and lead-time claims from About/Upholstery pages. Retained the supplied owners, location and 2013 story.
- Removed unverified delivery rates, disposal charges, lead times and bespoke-return claims. Delivery and returns pages now link to the official client policies and offer contact, without restating unsupported terms.
- Removed the newsletter form from the site: it only saved email addresses locally but promised a subscription. Its source file and any existing browser storage are preserved.
- Removed duplicated footer address placements. Homepage contact details appear in Visit and footer (closed Task 1 navigation is not counted as page content).

## Deferred — requires the owner, not a coding guess

1. **Full production access protection:** Vercel rejected protection of all production URLs under the current plan. Standard protection is enabled for preview/deployment URLs. The main production alias remains public, with noindex/nofollow safeguards; an owner plan/access decision is required.
2. **Email posting:** reservation enquiries open a prefilled email to hometrendsennis@gmail.com. A direct server-side submission needs an approved mail service and credentials. No automatic reservation or email delivery is claimed.
3. **Stock and lead times:** the live online catalogue does not establish physical floor stock or a 4–6 week order lead time. Those claims remain hidden pending confirmation. Checkout has not been enabled.
4. **Catalogue decisions:** six ambiguous collection assignments, 48 SKU-led names and 262 missing dimensions have owner CSVs from Task 5. Seven replacement mattress photographs, the owners' portrait, labelled usable swatches and the optional video are still needed.
5. **Reviews:** quotes are from the existing supplied review data and were corroborated externally. Google inbox has photographs, not review text. The 4.9/94 aggregate is a corroborated snapshot, not a freshly verified Google count.
6. **Conflicting instructions:** the frozen Task 1 menu still has one “Errigel” label and its own legacy typography/palette. It was not modified under the explicit Task 1 freeze. The word is removed from homepage content, footer and content pages; changing the menu label needs permission to touch Task 1.

## Verification evidence

Build, lint and typecheck commands are run for each task. Lint retains four pre-existing warnings, no errors. Browser screenshots and JSON verdicts are under screenshots/task-6-*. Final catalogue/media/redirect assertions are in final-catalogue-audit.json. The initial built-site check caught an SSR metadata initialization failure; it was fixed before commit/deployment.

Task reports: task-0.md, task-2.md, task-3.md, task-4.md and task-5.md. Exact title/slug, collection, price and image changes are in the adjacent CSV/JSON reports.
