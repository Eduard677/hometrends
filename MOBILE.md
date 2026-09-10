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

**Type floor already met.** No text renders below 14px on any audited template,
so the 14px metadata minimum required no change — recorded rather than
"fixed".

## Outstanding

Not done in this pass, stated plainly:

- **§4 Navigation** — menu focus trap, body scroll lock, close on route change
  and Escape, Android back button, one-tap full-screen search, sticky-header
  hide-on-scroll.
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
