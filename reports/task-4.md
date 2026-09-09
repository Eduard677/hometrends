# Task 4 — people, visit and reviews

- OwnersSection uses the supplied ImageSlot pattern with a labelled portrait placeholder. Retained the factual family story; removed the duplicated address/hours/telephone block. Portrait still needed at public/media/story/finbar-eileen.jpg.
- VisitSection is the strongest dark block, with the actual shopfront photograph, prominent filled phone action, exact directions URL, address/Eircode, supplied parking line, hours and family-owned line.
- Europe/Dublin open/closed state starts after mount, updates every 60 seconds, and uses the provided Mon–Sat 09:30–18:00 / Sunday closed schedule. Holiday exceptions are not invented.
- Reviews are three simultaneous cards, each linked to Google, using unchanged quotations already in src/lib/reviews.ts. Removed stale relative review dates and carousel controls.
- asset-inbox/google contains only images and INDEX.md, no review-text scrape. Existing first three quotations were corroborated at https://paintireland.ie/listing/home-trends-ennis-ennis/ on 7 September 2026. Its aggregate snapshot is 4.9 / 94, used here. The direct Google short URL returned no readable listing; a current Google count remains for owner verification. Do not change to 95 without evidence.
- Removed the watermarked Sleep Rest 800 mattress phone photograph from the gallery strip. Four panels remain. Original asset is preserved; no longer referenced by that component.
- Homepage contact details now appear in VisitSection and the footer; Task 1's closed navigation remains untouched.
