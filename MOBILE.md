# Home Trends — dedicated mobile pass

Branch `polish-mobile-2`. One commit per section. No product data, prices or
photography touched.

**Matrix used:** 320×568, 360×800, 390×844, 430×932, 844×390 landscape ×
7 templates (home, /shop, PDP with variants `troy-cabinet`, PDP without
variants `new-york-storage-bed`, collection `/collections/living-room`, cart,
form `/contact`) = 35 combinations. 320 treated as the pass/fail floor.

---

## Issues found and fixed

| # | Issue | Width | Templates | Fix |
| --- | --- | --- | --- | --- |
| 1 | `.footer-grid` columns computed to **228.344px + 92.875px = 321px inside a 280px container**, pushing 17 elements to `right=369`. `styles.css` narrows it to `1fr 1fr`, but `fr` will not shrink past a column's min-content. | 320, 360 | **all 7** | `repeat(2, minmax(0, 1fr))`, single column below 380, long labels allowed to wrap |
| 2 | Instagram account row could not fit glyph + handle + shop name + Follow pill on one line; Follow crossed the viewport edge | 320 | home | row wraps below 360; Follow tap target stays 114×44 |
| 3 | No `dvh`/`svh` anywhere — 21 `vh` declarations; address-bar collapse resized the hero and reflowed the fold | all | all | wrapper `100dvh`, `.ed-hero` `82svh`, behind `@supports` |
| 4 | **No `env(safe-area-inset-*)` anywhere**, on any of 25 fixed/sticky elements — bottom sheets sat under the home indicator | all | all | bottom inset added to bag drawer, filter sheet, menu panel, search panel, reserve modal, bag confirm, orior bar, zoom overlay; left/right inset on the header for the landscape notch |
| 5 | One form control computed to **14px** — enough for iOS to zoom on focus and never zoom back | all | form | 16px floor; needed `!important` on that one property because earlier layers set control sizes from higher-specificity selectors. Verified: 39 controls across 4 templates, none under 16px |
| 6 | Default translucent blue tap highlight | all | all | `-webkit-tap-highlight-color: transparent`, with `:active` states taking over |
| 7 | **23 footer anchors under 44px on every template** (footer is sitewide), filter chips at 34px, pagination and gallery thumbnails under 44px | ≤900 | all | 44px minimum + 4px block padding for 8px separation, scoped under 900px |
| 8 | No tap acknowledgement once the blue highlight was removed | all | all | `:active` opacity + small scale on cards/buttons; scale disabled under `prefers-reduced-motion` |
| 9 | Product grid rendered **1-up** on phones, not 2-up | 320, 390 | shop, collection | `repeat(2, minmax(0, 1fr))` below 900 |
| 10 | Card heights came in two values (571 / 538 at 320) because titles wrapped to different line counts, so prices and CTAs sat at different heights across a row | 320, 390 | shop, collection | names clamp to 2 lines with a reserved 2-line min-height; verified with a 77-char title at 320 — all clamp, **0 misaligned rows** |
| 12 | Tab walked straight out of an open drawer into the page behind it | all | all | focus trap on the open panel, verified over 25 tab presses |
| 13 | Android back left the site instead of dismissing an open drawer | all | all | history entry pushed on open, consumed on close |
| 14 | Adding a second body scroll lock re-locked the page permanently: it captured `"hidden"` from the existing lock as its restore value | all | all | duplicate removed; scrollbar-gutter compensation folded into the pre-existing lock instead |
| 11 | Prices had `font-variant-numeric: normal`, so struck prior price and current price drifted | all | shop, PDP, cart | `tabular-nums` on prices, cart totals, PDP spec values |

**Overflow result:** `document.documentElement.scrollWidth <= clientWidth` on
every template at every width in the matrix. The page never scrolls
horizontally.

---

## Judgement calls

**Probe hits inside scrollers are not bugs.** The raw selector from the brief
flags every element inside a deliberate `overflow-x: auto` container — the room
rail, the Complete-the-room rail, the mobile gallery. The audit walks each
element's ancestors and excludes those, rather than "fixing" intended
horizontal scrollers.

**Inline links left under 44px.** WCAG's target-size criterion exempts a link
sitting inside a sentence. Padding links in body copy to 44px would break the
prose, so the re-audit filters `p, li, .prose, .lead, figcaption, cite`
descendants out instead of pretending they were fixed.

**`!important` used once**, on `font-size` for form controls only. Justified:
it is an iOS zoom-prevention floor and the existing stylesheets set control
sizes from several higher-specificity selectors.

**`svh` for the hero, `dvh` for the wrapper.** `dvh` on a hero would make it
grow as the address bar retracts, reflowing the fold mid-scroll — the exact
thing the brief asks to prevent. `svh` sizes it for the bar-visible case.

**`:active` uses opacity and scale, never colour** — a colour change on tap
could be mistaken for a selected state.

---

## Verified, no change needed

**Sticky header does not need hide-on-scroll.** Measured at 390: 64px, which
is **8% of viewport** — comfortably under the 15% threshold in the brief, so
the behaviour is not warranted.

**Close-on-route-change, Escape-with-focus-return and the Cmd/Ctrl+K shortcut
already existed** in chrome.tsx and were left alone.

**Type floor already met.** No text renders below 14px on any audited template,
so the 14px metadata minimum required no change — recorded rather than
"fixed".

## Outstanding

Not done in this pass, stated plainly:

- **§4 remainder** — one-tap full-screen search is present but was not
  re-verified at phone widths this pass.
- **§5 Filters** — bottom sheet with drag-to-dismiss, sticky `Apply (n)` above
  the safe area, body scroll lock, removable active-filter chips.
- **§6 PDP** — sticky bottom price + CTA bar, pinch zoom, variant chips,
  accordions for specs and delivery.
- **§8 Forms** — `type`/`inputmode`/`autocomplete` audit, submit button clear of
  the keyboard, errors tied to inputs.
- **§9 Performance** — Slow 4G + 4× CPU, LCP, preload, `sizes` accuracy, page
  weight and request count.
- **§10 Accessibility at mobile widths** — 200% text reflow at 320, landscape
  usability, reduced-motion on the gallery.

**Shop still has 24 standalone targets under 44px** after §3 — the footer and
chips are fixed, so the remainder is elsewhere on that template and needs its
own look.

**No Lighthouse scores appear in this document, and no screenshots were written
to `/screenshots/mobile/`.** Lighthouse was not run and the before/after
screenshot set was not captured. Inventing either would be worse than their
absence.


---

## Lighthouse mobile — before / after

Run with `lighthouse@12` against **production**, mobile preset, which applies
Slow 4G and 4× CPU throttling by default. Not the dev server: dev is
unminified and uncompressed, and its numbers would be meaningless.

| Template | perf before | perf after | LCP before | LCP after | CLS after | Weight | Reqs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home | 64 | **91** | 6.25s | **3.18s** | 0.000 | 1.28MB | 64 |
| shop | 68 | **75** | 8.84s | **6.85s** | 0.003 | 1.36MB | 81 |
| collection | 60 | **63** | 6.98s | **5.60s** | 0.124 | 1.28MB | 80 |
| pdp | 92 | 61–74 | 3.03s | 5.3–6.9s | 0.000 | 1.05MB | 44 |

**What drove the gains:** Lighthouse's `lcp-lazy-loaded` audit was *failing* on
/shop and on collection pages. `PageFrame`'s hero plate is the LCP element on
both and was inheriting `SiteImage`'s lazy default — the one image guaranteed
to be above the fold was the one told to wait. Now eager with
`fetchpriority=high`; the audit passes on all four templates.

**The PDP row is not a clean measurement, and should not be read as a
regression.** The `92 / 3.03s` baseline is a single run. Every subsequent PDP
measurement — five on current production, three against the previous
deployment URL — clusters at 61–74 with LCP 4.1–6.9s. The fast reading has
never reproduced. I also tried deferring both §6 mount effects past first paint
on the theory that they blocked LCP; it made no difference, which is evidence
against that explanation rather than for it. The previous-deployment URL
returns 302 under deployment protection and Lighthouse follows redirects, so
those three runs may have measured current production anyway. Net: I cannot
attribute the delta, and I am not claiming either a regression or a fix.

**No template exceeds the 2MB flag** — 1.05–1.36MB across all four.

**Still failing:** collection CLS at 0.124, over the 0.1 threshold. Lighthouse
returned no `layout-shift-elements` detail to attribute it to, so it needs its
own investigation rather than a guess.

## Sections 5, 6, 8, 9, 10

| # | Issue | Fix |
| --- | --- | --- |
| 15 | Filter sheet did not lock body scroll — the page scrolled behind it | lock in `filter-bar.tsx`, deliberately not by extending the chrome lock (see §4's stacking bug) |
| 16 | Apply footer was `position: static` and scrolled away with the options | sticky, safe-area padded; verified still in view after scrolling the body to its end |
| 17 | Nothing showed which filters were on once the sheet closed | removable active-filter chip row above the grid, 44px targets, `sr-only` "Remove filter" label |
| 18 | PDP Add button sat 884px down an 844px viewport | sticky price + CTA bar, inert until shown (`visibility:hidden`, `tabIndex -1`), shares the add handler with the inline button |
| 19 | Description made the PDP a mile long | collapses behind a 44px summary at phone widths, 3232px → 3060px; rendered open and closed after mount so it fails open |
| 20 | Reserve sheet capped in `vh`, so the on-screen keyboard hid Submit | `88dvh`, which tracks the visible viewport; verified submit in view |
| 21 | Missing keyboard hints | `inputMode`, `enterKeyHint`, `autoCapitalize`/`autoCorrect`/`spellCheck` per field type |
| 22 | Landscape 844×390: header 20% of viewport, gallery 955px tall in a 390px viewport | short-landscape only: header 48px (12%), gallery follows viewport height — 955px → 304px; portrait verified unchanged |

**Verified, no change needed:** WCAG 1.4.10 reflow passes on all five templates
at 200% text (no scroll, no overflow, no clipped content). `prefers-reduced-motion`
is genuinely honoured — reveal starts open at `inset(0)`, sticky bar and
accordion marker both report `0s`. PDP variants are already tappable chips, the
gallery already has dot indicators, and pinch zoom already works (no
`user-scalable=no`).

**Bug found and fixed inside §6:** the sticky bar first used an
`IntersectionObserver`, which never fired — the button starts below the viewport
and ends above it, both "not intersecting", so on a fast scroll the state never
changes. Verified failing at scrollY 1600 with the button at top −716. Replaced
with a rAF-throttled scroll measurement.

## Still outstanding

- Custom inline form validation. Native `required` is in use; replacing it is a
  forms rewrite, not a mobile fix.
- Custom inline form validation (native `required` is in use).
- Collection CLS — attributed, attempted, reverted. See below.

## Closed since

**Screenshots captured.** 35 shots — 7 templates × 5 widths — in
`/screenshots/mobile/`, compressed to WebP (17.1MB → 3.3MB). Named
`template-WxH-after.webp`. They are **after-only**: the work was already
deployed by the time they were taken, so there is no honest "before" to pair
them with.

**`document.scrollWidth <= clientWidth` on all 35.** The 320 floor holds on
every template at every width in the matrix.

**Shop tap targets: 24 → 3.** The remainder are the brand logo in the frozen
header and two unclassed anchors.

**home@320 clipped element: fixed.** It was a product-card title anchor whose
inline box ran 5px past its clamped `h3`. The `h3` clipped it and the page never
scrolled, so it was never visible; long titles now break instead.

**Collection CLS — attributed, fix attempted, reverted.** Lighthouse gave no
`layout-shift-elements`, so a `PerformanceObserver` was used instead: 0.0612 of
the total came from `.issue__plate` moving up 28px, because the lead paragraph
reflows 3 lines → 2 (84px → 56px) when Cormorant Garamond loads. The SSR text
is byte-identical, so it is font swap, not late content.

A metric-matched fallback was built from a measured ratio — the same string
renders at 87.91% of Georgia's width in Cormorant Garamond — and it **made
things worse**: CLS went 0.070 → median 0.189 across four runs, because
`src: local(...)` resolves asynchronously and so added a *second* swap. It was
reverted; CLS returned to 0.0652, stable across three runs.

A real fix means self-hosting and preloading the font so there is no swap at
all. That is a build change, not a stylesheet one, and is left documented
rather than half-applied.


---

## Font self-hosting — the CLS fix, and its trade

Three attempts, measured each time.

| Attempt | collection CLS | shop CLS | First-visit type |
| --- | --- | --- | --- |
| Google Fonts + `swap` (original) | 0.070 | — | real font after swap |
| Metric-matched `local()` fallback | **0.189** ✗ | — | real font after two swaps |
| Self-hosted + preload + `swap` | 0.061 | **0.148** ✗ | real font after swap |
| Self-hosted + preload + **`optional`** | **0.000** | **0.000** | **fallback (Georgia)** |

Seven latin-subset woff2 faces now serve from `/fonts` (276KB): Cormorant
Garamond 400/500/600 + 400 italic, Inter 400/500/600. The
`fonts.googleapis.com` stylesheet and its two preconnects are gone, removing a
cross-origin round-trip that had to finish before the font files were even
discovered. Inter 400 and Cormorant Garamond 400 are preloaded — the two faces
above the fold. The other five are not, because preloading all seven competes
for bandwidth with the LCP image.

**Self-hosting alone did not fix it.** With `swap` the browser still paints the
fallback first by design, so the lead still reflowed 84px → 56px; collection
came down to 0.061 but **shop was 0.148, over the 0.1 threshold**.

**`font-display: optional` fixed it completely** — 0.000 on collection, shop,
home and PDP, three runs each.

### The trade, stated plainly

`optional` gives each face a ~100ms block period and then keeps the fallback
for the rest of that page's life rather than swapping. Measured on the live
site:

- **First visit:** lead renders 84px in Georgia. The font downloads but is not
  applied to already-painted text.
- **Second visit (warm cache):** lead renders 56px in Cormorant Garamond.

So first-time visitors see the fallback serif, and returning visitors see the
brand serif. CLS is 0.000 for both. There is no invisible-text flash either
way.

**This is a brand decision as much as a performance one.** For a showroom whose
identity leans on the serif, showing Georgia to first-time visitors may not be
worth 0.061 of CLS on one template. Reverting is one word in
`src/styles.fonts.css` — `optional` back to `swap` — which restores the brand
font on every visit at the cost of collection 0.061 / shop 0.148.
